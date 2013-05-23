---
layout: post
title: "Three Octopress Tweaks"
date: 2013-05-20 09:39
comments: true
categories: [meta, octopress]
---

I've just updated [Octopress](http://octopress.org/) to the latest and greatest version, including re-applying my various customizations.  So, now that I happen to have them all in one place, here are three quick ways I've improved the base Octopress install:

* <a href="/2013/05/20/three-octopress-tweaks/#github-aside">Filter some repositories from GitHub sidebar</a>
* <a href="/2013/05/20/three-octopress-tweaks/#pinboard-aside">Limit Pinboard sidebar to a specific tag</a>
* <a href="/2013/05/20/three-octopress-tweaks/#archive-path">Move the Archive page to /archive</a>

<!--more-->

Allons-y!

<a name="github-aside"></a>

## Filter some repositories from GitHub sidebar

If you're hosting your Octopress blog on GitHub Pages, it's kind of pointless to have that repository show up in the sidebar, especially since it doesn't contain anything particularly interesting.

But you can also use this tweak to hide that secret project you're working on... or that old, embarrassing one that never did work quite right.

{% coderay _config.yml lang:diff https://github.com/codebykat/blog/commit/6fad9a1a0342ef9a2424ea0b695677d844985f7f %}
@@ -67,6 +67,7 @@
 	github_repo_count: 0
 	github_show_profile_link: true
 	github_skip_forks: true
+	github_skip_repos: []  # list of repos to hide from the sidebar. ex: [blog, username.github.io, old_embarrassing_project]
{% endcoderay %}

{% coderay source_includes/asides/github.html lang:diff https://github.com/codebykat/blog/commit/6fad9a1a0342ef9a2424ea0b695677d844985f7f %}
{% raw %}
@@ -21,6 +21,7 @@
             user: '{{site.github_user}}',
             count: {{site.github_repo_count}},
             skip_forks: {{site.github_skip_forks}},
+            skip_repos: [ {% for repo in site.github_skip_repos %}"{{repo}}"{% unless forloop.last %}, {% endunless %}{% endfor %} ],
             target: '#gh_repos'
         });
     });
{% endraw %}
{% endcoderay %}

{% coderay source/javascripts/github.js lang:diff https://github.com/codebykat/blog/commit/6fad9a1a0342ef9a2424ea0b695677d844985f7f %}
@@ -21,6 +21,7 @@
           if (!data || !data.data) { return; }
           for (var i = 0; i < data.data.length; i++) {
             if (options.skip_forks && data.data[i].fork) { continue; }
+            if ( jQuery.inArray( data.data[i].name, options.skip_repos ) != -1) { continue; }
             repos.push(data.data[i]);
           }
           if (options.count) { repos.splice(options.count); }
{% endcoderay %}

<a name="pinboard-aside"></a>

## Limit Pinboard sidebar to a specific tag

I bookmark a lot of things on [Pinboard](http://pinboard.in), most of which aren't exactly technical in nature.  Here's a quick change that lets you save bookmarks with a specific tag (I use "blog") to show them on the sidebar.

And since we're here anyway, may as well also change the header and loading text (I don't know why, but I've never liked the word "linkroll").  I also removed the tags to make it less cluttered.

{% coderay _config.yml lang:diff https://github.com/codebykat/blog/commit/7718a6ce9d3a5b84dbc663547c878d26200842f0 %}
        # Pinboard
        pinboard_user:
        pinboard_count: 5
+       pinboard_tag: blog
{% endcoderay %}

{% coderay source/_includes/asides/pinboard.html lang:diff https://github.com/codebykat/blog/commit/7718a6ce9d3a5b84dbc663547c878d26200842f0 %}
{% raw %}
@@ -1,13 +1,14 @@
 <section>
-  <h1>My Pinboard</h1>
-  <ul id="pinboard_linkroll">Fetching linkroll...</ul>
-  <p><a href="http://pinboard.in/u:{{ site.pinboard_user }}">My Pinboard Bookmarks &raquo;</a></p>
+  <h1>Bookmarks</h1>
+  <ul id="pinboard_linkroll">Fetching bookmarks...</ul>
+  <p><a href="http://pinboard.in/u:{{ site.pinboard_user }}/t:{{ site.pinboard_tag }}">see more &raquo;</a></p>
 </section>
 <script type="text/javascript">
   var linkroll = 'pinboard_linkroll'; //id target for pinboard list
   var pinboard_user = "{{ site.pinboard_user }}"; //id target for pinboard list
   var pinboard_count = {{ site.pinboard_count }}; //id target for pinboard list
+  var pinboard_tag = "{{ site.pinboard_tag }}";
   (function(){
     var pinboardInit = document.createElement('script');
     pinboardInit.type = 'text/javascript';
{% endraw %}
{% endcoderay %}

{% coderay source/javascript/pinboard.js lang:diff https://github.com/codebykat/blog/commit/7718a6ce9d3a5b84dbc663547c878d26200842f0 %}
@@ -41,16 +41,16 @@ function Pinboard_Linkroll() {
     if (it.n) {
       str += "<span class=\"pin-description\">" + this.cook(it.n) + "</span>\n";
     }
-    if (it.t.length > 0) {
-      for (var i = 0; i < it.t.length; i++) {
-        var tag = it.t[i];
-        str += " <a class=\"pin-tag\" href=\"https://pinboard.in/u:"+ this.cook(it.a) + "/t:" + this.cook(tag) + "\">" + this.cook(tag).replace(/^\s+|\s+$/g, '') + "</a> ";
-      }
-    }
     str += "</p></li>\n";
     return str;
   }
 }
 Pinboard_Linkroll.prototype = new Pinboard_Linkroll();
-pinboardNS_fetch_script("https://feeds.pinboard.in/json/v1/u:"+pinboard_user+"/?cb=pinboardNS_show_bmarks\&count="+pinboard_count);
+pinboardNS_fetch_script("http://feeds.pinboard.in/json/u:"+pinboard_user+"/t:"+pinboard_tag+"/?cb=pinboardNS_show_bmarks\&count="+pinboard_count);
{% endcoderay %}

If you want to do this for Delicious, it's [even easier](https://github.com/codebykat/blog/commit/2a7b4ebc811a07dd89fca14ca158d4e96bbb4b13#source/_includes/asides/delicious.html).

<a name="archive-path"></a>

## Move the Archive page to /archive

Even if you have Octopress set to use the root directory, it defaults to putting your post archive under /blog/archive.  I found the fix in [this post](http://hackingoff.com/blog/jekyll-octopress-in-a-subdirectory-removing-redundant-slash-blog-path-to-archives-and-categories/):

* Move source/blog/archive/index.html to source/archive/index.html.
* Update navigation links accordingly, in source/_includes/custom/navigation.html and source/index.html.  (*Note: the example given is inconsistent; whether you're using "archive" or "archives", just ensure all the links match the directory name!*)

I was originally planning to wrap this post up with a mention of prettifying code snippets, but that turned out to be a bit of a project, so I think it deserves its own post.