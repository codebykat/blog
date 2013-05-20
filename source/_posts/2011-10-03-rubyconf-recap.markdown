---
layout: post
title: "RubyConf Recap"
date: 2011-10-03 10:58
comments: true
categories: [Ruby, conferences]
---

[RubyConf 2011](http://rubyconf.org/) was my first technical conference 
as a Rubyist, and it was an absolute blast.  I was afraid that many of 
the talks would be too advanced, since I've been writing Ruby for less 
than a year, but on the whole there was a good mix for programmers at 
any level.  Not only did I learn a ton, I got to spend three days 
rubbing elbows with a bunch of smart, inspiring and genuinely nice 
folks. It was great to put faces to some of the names I'd seen online 
and get to hear about what everyone's working on.  As my first real dose 
of the Ruby community, the experience was nothing but positive.

<!--more-->

My main takeaways from the conference: I want to be more involved with
the Ruby/open-source community, my tests are terrible (well, that's not really news),
and concurrency/threading is a hot topic in the Ruby world right now.  Oh,
and now I understand what these variants everyone is always talking about (JRuby,
Rubinius, etc.) actually are!

The three days of [talks](http://rubyconf.org/schedule) ran the gamut 
from general to specialized, from little toy programs to big 
multi-person projects. What follows is not exhaustive by any means: just 
my notes, what I found the most interesting and memorable.  (All the 
talks were recorded by [confreaks](http://confreaks.net/); videos should 
be available [here](http://confreaks.net/events/rubyconf2011) sometime 
soon.)

## Zach Holman: [How Github Uses Github to Build Github](http://rubyconf.org/presentations/62)

Zach Holman's talk was mainly about Github's corporate culture and the 
organic, [slightly anarchistic](http://blog.steveklabnik.com/2011/10/01/github-is-anarchy-for-programmers.html) 
process (or, if you prefer, anti-process) they use to manage the 
[Github](http://github.com/) codebase.
Zach talked about 
his experiences with a team that works asynchronously: geographically 
and temporally separate, without deadlines, meetings, interruptions, or 
any other sort of unnecessary overhead.
Quite a bit of interesting stuff 
here -- it'd definitely be worth watching the video.

As appealing as all of this sounds, as with any process, what works well 
for one specific group wouldn't necessarily translate well to a 
different setting.  Someone in the audience did point out that Github 
doesn't have any clients, and thus can be more flexible about deadlines. 
I do think that it hits the nail on the head in terms of developer 
motivation and efficiency, so even if you can't adopt it wholesale, it's 
worth looking at to see if any of the pieces might be a good fit.  If 
nothing else, I'm sure that offering so much autonomy ensures that 
Github attracts some of the best developers out there.

Pikimal developers actually do work asynchronously quite a bit (we have 
a persistent chatroom, somewhat flexible hours and many opportunities to 
work remotely).  If we could figure out how to adapt it to our workflow, 
I think there might be something to be learned from the Github 
treatment of deadlines and scheduling.  As for deployment, I would *definitely* love to make 
our continuous integration and build process more robust, as it's a big
source of developer stress for us right now.

#### LINKS

* [Zach's slides](http://zachholman.com/talk/how-github-uses-github-to-build-github)
* He also has some excellent [blog posts](http://zachholman.com/posts/how-github-works/) on Github's workflow
* [Scott Chacon on why Github doesn't use git-flow](http://scottchacon.com/2011/08/31/github-flow.html)
* [Merlin Mann on priorities](http://www.43folders.com/2009/04/28/priorities)


## Rob Sanheim: [How Getting Buff Can Make You a Better Rubyist](http://rubyconf.org/presentations/49)

Rob Sanheim has this outlandish idea that taking good care of 
yourself will make you a better programmer.  He's preaching to the 
choir, as far as I'm concerned; I've thought for some time that the 
hacker myth (i.e., that there's some kind of merit in coding night and day, 
fueled by coffee and Red Bull) can't die soon enough.  As Rob said, 
"We need to move away from a culture where working crazy hours and 
pulling all-nighters is [considered] a good way to get things done."

I love that he not only talked about his own experience in finding more
balance in his life, but provided some real data (neuroscience and
statistics) about why this is a great idea.
This has been my experience as well: the time you lose in taking better
care of yourself is more than recovered in better focus, more energy,
more creativity and just improved sanity generally.  (After this talk, [@dddagradi](http://twitter.com/#!/dddagradi) and I decided to officially start [c25k](http://www.c25k.com/).  We've done the first two runs already!)

Also: Getting everyone up to do "programmer yoga" at the beginning of the talk?  Total win.

#### LINKS
* [Rob's slides](http://dl.dropbox.com/u/7316160/rubyconf-2011-how-getting-buff-making-you-better-rubyist.pdf)
* [Sexy Yoga Time](https://gist.github.com/1251491)
* [The Creative Brain on Exercise](http://www.fastcompany.com/1783263/the-creative-brain-on-exercise)

## Steven Harms: [Practical Metaprogramming](http://rubyconf.org/presentations/56) vs. Joshua Ballanco: [Keeping Ruby Reasonable](http://rubyconf.org/presentations/30)

I loved these two talks because they showcased some of the interesting (and sometimes worrying) things
that can happen with a language like Ruby that allows you to dynamically
add or override function bindings in the running environment.

Steven Harms used these powers for good, illustrating his talk with the real-life
example of a program that models Latin verbs.  He made the concept of "metaprogramming"
seem much less scary and mysterious, and provided a beautifully-organized taxonomy of
metaprogramming patterns.  I did find his project extra interesting because learning Japanese is
a (sadly somewhat neglected) side project of mine, so I always love talking about
modeling human languages in terms of code.

Joshua Ballanc, on the other hand, had some very funny examples to illustrate how this powerful ability
can be used in problematic ways, and why this can be bad ("in this variation [of first-class environments],
the user simply cannot reason about his code").

#### LINKS

* [Steven's page with slides and resources](http://stevengharms.com/?p=2335)
* [Metaprogramming Spell Book](http://ducktypo.blogspot.com/2010/08/metaprogramming-spell-book.html)
* [Joshua's slides](http://slidesha.re/oYtC45)
* [Jrm on the dangers of first-class environments](http://funcall.blogspot.com/2009/09/first-class-environments.html)

## Jamis Buck: ["Algorithms" is not a Four-Letter Word](http://rubyconf.org/presentations/24)

Jamis' [hand-drawn slides](http://bit.ly/pghOIG) are amazing and 
adorable.  Seriously, go play with them, they're even interactive!  While
the concepts will be old hat for anyone with a CS background,
I loved the sense of playfulness and exploration.  This is what programming 
is all about.  (Also, I kind of want to write some maze-generation code 
now.)


## Dr Nic Williams: [Threading vs Evented](http://rubyconf.org/presentations/18)

This is a talk I walked into wondering whether I'd understand anything, 
but it was actually quite interesting (and funny; I swear Dr Nic is 
secretly a stand-up comedian).  His slides don't seem to be online, but 
I'll be sure to link the video once it's up.  Lots of great info about 
multithreading in Ruby, best practices and some of the underlying 
implementation issues.

The basic takeaway was that, currently, the *only* way to get good 
performance with multithreading in Ruby is with the stack of nginx + 
Trinidad + JRuby. I was surprised to learn that the reference Ruby 
implementation is <del>single-threaded</del> often limited to a single
Ruby thread per processor<super>*</super> (and, judging from some of the Q&As, 
this may not be fixed anytime soon).  Word on the street, by the way, is
that Rubinius is working on better concurrency support as well.

<small>(<super>*</super>Updated with clarification from @merbist and @steveklabnik.  Thanks guys!)</small>

Interesting side note: I looked up the GIL on Wikipedia 
and learned that Python is in exactly the same situation (the vanilla C implementation
has a GIL but the Java-based version -- in Python's case, Jython -- does
not).

####LINKS
* [JRuby](http://jruby.org/)
* [Trinidad](http://rubygems.org/gems/trinidad)
* [Wikipedia: Global Interpreter Lock](http://en.wikipedia.org/wiki/Global_Interpreter_Lock)

## Steve Klabnik: [Shoes](http://rubyconf.org/presentations/55) + Ron Evans: [KidsRuby](http://rubyconf.org/presentations/51)

Maybe it's just the years I spent working for various universities, but 
I'm always interested in teaching tools and serious games. I think 
projects like HacketyHack and KidsRuby are a great way to make 
programming more accessible to the next generation, many of whom don't have
access to any kind of formal CS education.
Both Steve Klabnik and Ron Evans emphasize (and exemplify) the passion and 
natural curiosity that is so fundamental to our vocation as coders.

#### LINKS
* [Shoes](http://shoesrb.com/)
* [HacketyHack](http://hackety-hack.com/)
* [KidsRuby](http://kidsruby.com/)

## Gregory Moeck: [Why You Don't Get Mock Objects](http://rubyconf.org/presentations/21) + Chris Parsons: [Your Tests are Lying to You](http://rubyconf.org/presentations/12)

I admit it: my test-fu is weak.  I don't write tests as often as I 
should, and when I do write them, I often copy-and-paste bits and pieces 
of other tests without fully understanding how they work.  So Gregory 
Moeck's discussion of mock objects, including some simple rules for how 
to use them, was very enlightening.  His slides were full of pithy 
little rules of thumb like "Mock roles, not objects", "Mocks assert on 
messages", and "Only mock types you own".

I actually missed the other testing talk, "Your Tests are Lying to You", 
but I heard a lot about it after the fact, so I looked up and enjoyed 
the slides. I'm putting them here, too, for your edification and to 
remind myself to check out the video when it gets posted.

####LINKS
* [Gregory's slides](http://speakerdeck.com/u/gmoeck/p/why-you-dont-get-mock-objects)
* [Wikipedia: Single Responsibility Principle](http://en.wikipedia.org/wiki/Single_responsibility_principle)
* [Growing Object-Oriented Software, Guided by Tests](http://www.amazon.com/Growing-Object-Oriented-Software-Guided-Tests/dp/0321503627/ref=sr_1_1?s=books&ie=UTF8&qid=1317313536&sr=1-1)
* [Chris' slides](http://speakerdeck.com/u/chrismdp/p/your-tests-are-lying-to-you)


##QUOTABLE
<blockquote>
TDD (Twitter-Driven Development): Push to production and see if people are complaining about it.<br />
<cite><a href="http://twitter.com/#!/holman">Zach Holman</a></cite>
</blockquote>

<blockquote>
Every day that I don't type Thread.new is a day that my app might work.<br />
<cite><a href="http://twitter.com/#!/drnic">Dr Nic</a>, on the value of abstracting away multithreading code</cite>
</blockquote>

<blockquote>
Write-only code: Code you write once and can never read again.<br />
<cite>unknown (possibly Chris Parsons?), via <a href="http://twitter.com/#!/davidfurber/status/119899372325572608">@davidfurber</a></cite>
</blockquote>

<blockquote>
Candy Machine Interfaces: APIs that make it too easy to do the wrong thing.<br />
<cite><a href="http://twitter.com/#!/jimweirich">Jim Weirich</a></cite>
</blockquote>

## NEW BOOKMARKS
* [Ruby Rogues podcast](http://rubyrogues.com/)
* [Ruby Koans](http://rubykoans.com/)
* [railsplugins.org](http://railsplugins.org)

## ALSO RECOMMEND
* [The Green Goddess](http://greengoddessnola.com).  Seriously, if you're ever in New Orleans, you should go there.  The food is delicious and the atmosphere is completely charming.
* [Astral Project](http://www.astralproject.com/).  Authentic New Orleans jazz (I hear their sax player is quite good).
* [This](http://www.youtube.com/watch?v=IfeyUGZt8nk).  You're welcome.
