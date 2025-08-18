---
title: Changelog
layout: default
permalink: /changelog/
---
{% capture log %}{% include_relative CHANGELOG.md %}{% endcapture %}
{{ log | markdownify }}

