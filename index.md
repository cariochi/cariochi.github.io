---
layout: default
title: Overview
---

# Overview

Welcome to the Cariochi docs hub. Pick a project to start:

<ul>
{% assign project_pages = site.pages | where_exp: 'p', 'p.url contains "/projects/"' %}
{% assign slugs = '' | split: '' %}
{% for p in project_pages %}
  {% assign parts = p.url | split: '/' %}
  {% assign slug = parts[2] %}
  {% if slug and slug != '' %}
    {% unless slugs contains slug %}
      {% assign slugs = slugs | push: slug %}
    {% endunless %}
  {% endif %}
{% endfor %}
{% assign slugs = slugs | sort %}
{% for slug in slugs %}
  <li><a href="{{ '/projects/' | append: slug | append: '/' | relative_url }}">{{ slug | capitalize }}</a></li>
{% endfor %}
</ul>

<a class="github" href="https://github.com/cariochi" target="_blank">View on GitHub</a>
