# _plugins/search_index.rb
# frozen_string_literal: true

require "json"

module SearchIndex
  class Generator < Jekyll::Generator
    priority :low

    def generate(site)
      docs = []

      items = []
      items.concat(site.pages) if site.respond_to?(:pages)
      if site.respond_to?(:collections)
        site.collections.each_value { |c| items.concat(c.docs) }
      end

      items.each do |doc|
        next if doc.data && doc.data["search"] == false

        src = (doc.content || "").dup.to_s

        # Розіб’ємо markdown на H1/H2 секції
        sections = split_md_into_sections(src)

        sections.each do |sec|
          title_chain = [doc.data["title"] || doc.basename_without_ext]
          title_chain << sec[:h1] if sec[:h1]
          title_chain << sec[:h2] if sec[:h2]
          title = title_chain.join(" → ")

          anchor_title = sec[:h2] || sec[:h1]
          url =
            if anchor_title && doc.url
              # anchor = Jekyll::Utils.slugify(anchor_title, mode: "default")
              anchor = heading_id(anchor_title)
              "#{doc.url}##{anchor}"
            else
              doc.url
            end

          content = markdown_to_text(sec[:body])

          docs << {
            "title" => title,
            "url" => url,
            "content" => content
          }
        end
      end

      json = JSON.pretty_generate(docs)

      page = Jekyll::PageWithoutAFile.new(site, site.source, "/", "search.json")
      page.content = json
      page.data["layout"] = nil
      site.pages << page
    end

    private

    # Розбити markdown на секції H1/H2
    # Повертає масив елементів: { h1: "...", h2: "...", body: "..." }
    def split_md_into_sections(markdown)
      lines = markdown.to_s.lines

      sections = []
      current_level = nil # nil | 1 | 2
      h1_title = nil
      h2_title = nil
      buf = []

      flush = lambda do
        return if buf.empty?
        sections << { h1: h1_title, h2: h2_title, body: buf.join }
        buf.clear
      end

      lines.each do |line|
        if (m = line.match(%r{^\s{0,3}\#\s+(.*)$})) # H1
          # закриваємо попереднє H2/H1
          flush.call
          h1_title = m[1].strip
          h2_title = nil
          current_level = 1
        elsif (m = line.match(%r{^\s{0,3}\#\#\s+(.*)$})) # H2
          flush.call
          h2_title = m[1].strip
          current_level = 2
        else
          buf << line
        end
      end

      # фінальний flush
      flush.call

      # якщо на сторінці не було жодного H1/H2 — нічого не індексуємо
      sections.select { |s| s[:h1] || s[:h2] }
    end

    # Додай десь вище у файлі (поза циклом)
    def heading_id(text)
      s = text.to_s.downcase
      # прибираємо все, крім літер/цифр/пробілів/підкреслення/дефісів
      s = s.gsub(%r{[^\p{Alnum}\s_-]+}u, '')
      s = s.strip
      # важливо: замінюємо КОЖЕН пробіл на '-', не стискаємо послідовності
      s.gsub(' ', '-')
    end

    # Грубе перетворення markdown/HTML у plain text для пошуку
    def markdown_to_text(s)
      txt = s.dup.to_s

      # fenced code blocks ``` ... ``` / ~~~ ... ~~~
      txt.gsub!(%r{(^|\n)```.*?\n.*?(^|\n)```}m, "\n")
      txt.gsub!(%r{(^|\n)~~~.*?\n.*?(^|\n)~~~}m, "\n")

      # inline code `...`
      txt.gsub!(%r{`([^`]*)`}, '\1')

      # images ![alt](url) -> alt
      txt.gsub!(%r{!$begin:math:display$([^$end:math:display$]*)\]$begin:math:text$[^)]+$end:math:text$}, '\1')

      # links [text](url) -> text
      txt.gsub!(%r{$begin:math:display$([^$end:math:display$]+)\]$begin:math:text$[^)]+$end:math:text$}, '\1')

      # HTML tags
      txt.gsub!(%r{</?[^>]+>}, " ")

      # прибрати заголовкові маркери на початку рядків: #### Title
      txt.gsub!(%r{^\s{0,3}\#{1,6}\s+}, "")

      # прибрати маркери списків
      txt.gsub!(%r{^\s{0,3}[-*+]\s+}, "")
      txt.gsub!(%r{^\s{0,3}\d+\.\s+}, "")

      # прибрати інлайн-виділення (* _ ~)
      txt.gsub!(%r{[*_~]}, "")

      # прибрати блокові цитати
      txt.gsub!(/^\s{0,3}>\s?/, "")

      # нормалізація пробілів
      txt.gsub!(/\r/, "\n")
      txt.gsub!(/[ \t]+/, " ")
      txt.gsub!(/\n{2,}/, "\n")
      txt.strip
    end
  end
end
