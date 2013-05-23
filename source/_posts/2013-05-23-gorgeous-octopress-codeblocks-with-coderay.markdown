---
layout: post
title: "Gorgeous Octopress Codeblocks with CodeRay"
date: 2013-05-23 09:00
comments: true
categories: [octopress, coderay, walkthroughs, jekyll, code]
---

When I upgraded to Octopress 2.0, I was pretty excited about the [syntax highlighting](http://octopress.org/blog/2011/07/23/octopress-20-surfaces/).  I eagerly went back to some old posts and wrapped my code in {% raw %}{% codeblock %}{% endraw %} tags.

But... the default Octopress codeblock colors leave something to be desired.  In fact, if you have a lot of code on the page, it starts to feel a bit like being underwater.

{% codeblock lang:ruby %}
def test
  @answer = 6*9
  if @answer != 42  # this should never happen
    raise "Oh no, not again."
  else
    print "Don't panic."
end
{% endcodeblock %}

I wanted codeblocks that looked more like GitHub's: lighter colors, softer edges, slightly less... well, blue.  So I started poking around, and here's what I wound up with:

{% coderay lang:ruby %}
def test
  @answer = 6*9
  if @answer != 42  # this should never happen
    raise "Oh no, not again."
  else
    print "Don't panic."
end
{% endcoderay %}

Ahhhhhhh.  Don't your eyeballs feel much happier now?  Read on to find out how it works!

<!--more-->

## 1. Add CodeRay to your project

By default, Octopress uses a Markdown processor called RDiscount, which defaults to [Pygments](http://pygments.org/) for code highlighting.  Pygments doesn't seem to have too many options, but it turns out if we switch to [kramdown](http://kramdown.rubyforge.org/) for Markdown processing, we can swap Pygments out for a highlighter called [CodeRay](http://coderay.rubychan.de/).  CodeRay allows for much more customization.

The best resource I found is [this excellent tutorial](http://blog.alestanis.com/2013/02/04/octopress-and-the-twilight-color-scheme/) on changing Octopress codeblocks over to a "Twilight" color scheme, à la Sublime Text.

Add kramdown and coderay to your Gemfile, and set the config options:

{% coderay Gemfile lang:ruby https://github.com/codebykat/blog/commit/23a74f1d96f0f592dab34c5003afefc99c75e026 %}
  gem 'kramdown'
  gem 'coderay'
{% endcoderay %}

{% coderay _config.yml lang:ruby https://github.com/codebykat/blog/commit/23a74f1d96f0f592dab34c5003afefc99c75e026 %}
markdown: kramdown
kramdown:
  use_coderay: true
  coderay:
    coderay_line_numbers: nil
    coderay_css: class
{% endcoderay %}

CodeRay has two options:

* **coderay_line_numbers**: can be nil (no line numbers), inline, list, or table.
* **coderay_css**: can be "style" or "class".  "Style" embeds the syntax highlighting in styles for each outputted element.  "Class" just gives them appropriate classes (e.g. "variable", "comment") and lets you style them yourself.  If you want to do any customization, you probably want to set this to "class".

Now if you `bundle install`, you will have CodeRay.  But... it won't do much of anything yet.

## 2. Styling

Here's the first "gotcha" with CodeRay: its syntax highlighting sets the proper classes on things, but it doesn't come with a stylesheet to actually style those elements.  If you request "class" styling, you're on your own.

If you want to use its default styles as a starting point (or you want to start from scratch and need to know which classes you'll get), check out [alpha.rb in the CodeRay source](https://github.com/rubychan/coderay/blob/master/lib/coderay/styles/alpha.rb).  I also found a couple of custom themes for CodeRay, including the [Twilight one](https://gist.github.com/iq9/2906599) mentioned in the tutorial post.

I eventually settled on [this one](http://www.andrewthorp.com/posts/github-theme-for-coderay), a GitHub imitation theme.

Find one you like, and save it in sass/custom with an underscore in front of the filename and a .scss extension, so you can import it in _styles.scss.  (The underscore tells sass not to compile it to css.)  I named mine _coderay-github.scss.

I also had to override a few Octopress styles that were still messing things up.

{% coderay sass/custom/_styles.scss lang:css https://github.com/codebykat/blog/commit/23a74f1d96f0f592dab34c5003afefc99c75e026 %}
/* overrides of the lousy styles from _syntax.scss */
.CodeRay pre {
  background: none;
  color: #000;
}

/* fixes issue where the whole line wouldn't get colored in a diff */
.CodeRay span.insert, .CodeRay span.change, .CodeRay span.delete {
	width: auto;
}

@import "coderay-github"
{% endcoderay https://github.com/codebykat/blog/commit/23a74f1d96f0f592dab34c5003afefc99c75e026 %}

And finally, I commented out a couple lines in _syntax.scss, because invisible scrollbars are... not good.
{% coderay sass/partials/_syntax.scss lang:diff https://github.com/codebykat/blog/commit/23a74f1d96f0f592dab34c5003afefc99c75e026 %}
@@ -208,11 +208,11 @@

-pre, .highlight, .gist-highlight {
+/*pre, .highlight, .gist-highlight {
   &::-webkit-scrollbar {  height: .5em; background: $solar-scroll-bg; }
   &::-webkit-scrollbar-thumb:horizontal { background: $solar-scroll-thumb;  -webkit-border-radius: 4px; border-radius: 4px }
 }
-
+*/
 .highlight code { 
{% endcoderay %}

I'd really rather override the styles than modify _syntax.scss, but I couldn't figure out how to accomplish that in a way that got the default scrollbar back, so that's what we're stuck with right now.  (If you figure out how to do this, please let me know!  It seems to me that a lot of the -webkit-scrollbar pseudoclasses don't actually work the way they should.)
 
## 3. Using CodeRay

If all has gone well, you should now be able to prettify your code with CodeRay.  Hooray!  But unfortunately, kramdown isn't a drop-in replacement for RDiscount.  You'll have to change a few things in older posts.

[kramdown syntax](http://kramdown.rubyforge.org/syntax.html#code-blocks) supports two styles of codeblock: fenced and indented.  It does **not** support the triple-backtick style (as seen in GitHub Flavored Markdown).

You also need to specify the language for syntax highlighting, which is done by passing a "lang" argument after the codeblock.  Thus:

**Fenced**:

~~~~~
~~~
def hello
  puts "hello world"
end
~~~
{% raw %}{:lang="ruby"}{% endraw %}
~~~~~
{:lang="ruby"}


**Indented**:

~~~~~
	puts "hello world"
{% raw %}{:lang="ruby"}{% endraw %}
~~~~~
{:lang="ruby"}

You can embed inline code using a single backtick, which is invoked like this: <code>`print 'hello'`{:lang="ruby"}</code> and looks like this: `print 'hello'`{:lang="ruby"}

### Some gotchas:

* CodeRay doesn't support all the same languages as RDiscount (shell, for one, is noticeably missing).  There's a list of supported languages on [the homepage](http://coderay.rubychan.de/).
* The codeblock Liquid tag will still work, but will invoke the default (Pygments) syntax highlighting.
* The opening fence can be as many tildes as you want (at least three); the closing fence needs to have at least as many as the opening fence did.
* Make sure to leave a blank line above any blocks and put the language declaration on its own line.
* The language declaration has [apparently changed](https://github.com/gettalong/kramdown/pull/15) to `{:.language-ruby}` in kramdown 0.14, and you will additionally be able to specify the language after the first fence.  Neither of these is working for me on kramdown 0.13.

## 4. Bonus Round: Captions!

So, this is all pretty cool, but the one thing I really missed from the default codeblocks was the neat captions with optional links.  At first I tried putting them in manually, and then realized that was silly, and I should just write a plugin based on the default code_block.rb plugin.

A bit of hacking later, and [voilà](https://github.com/codebykat/blog/blob/2f6c9615c02869dca5f52921ac5eb7e0b35a6427/plugins/code_ray_block.rb).  A plugin that uses the same pretty captions as the default codeblocks, but runs it through CodeRay for syntax highlighting.

Place this in your plugins directory, and you can use a {% raw %}{% coderay %}{% endraw %} tag with the same syntax as the default {% raw %}{% codeblock %}{% endraw %}.

I adjusted the margin of the caption in an inline style to scoot the codeblock up a little bit -- this cuts off the rounded edges at the top, so the code section looks attached to the caption.

It also helps to set the border colors of the codeblocks to match the captions:

{% coderay sass/custom/_styles.scss lang:css https://github.com/codebykat/blog/commit/23a74f1d96f0f592dab34c5003afefc99c75e026 %}
.CodeRay pre, p code, li code {
  border: 1px solid #565656;
  border-top-color: #cbcbcb;
  border-left-color: #a5a5a5;
  border-right-color: #a5a5a5;
}
{% endcoderay %}

There!  Gorgeous, highlighted, captioned codeblocks.  Aren't they lovely?

The full changeset is [here](https://github.com/codebykat/blog/commit/23a74f1d96f0f592dab34c5003afefc99c75e026) and the plugin is [here](https://github.com/codebykat/blog/commit/2f6c9615c02869dca5f52921ac5eb7e0b35a6427).  Comments and pull requests welcome!