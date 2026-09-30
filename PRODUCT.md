# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: small-business owners anywhere in the US.** Chicago is Lakefront's home base and identity, not its market. No dominant industry has been named.
- **Three situations bring them to the site.** Lakefront takes on all three:
  - a new website to build;
  - a WordPress site someone else built, which needs a host that will look after it;
  - an app or a non-WordPress site that needs deploying and running.
- **Their job:** hand the technical running of their web presence to someone accountable. Many also want help growing it through SEO, content, analytics, social media and performance work.
- **There are no hosting clients yet.** Do not show a returning-client support action until a support destination exists.
- **The founder** is the site's owner and only editor, and works on pages and posts in the EmDash admin.

## Product Purpose

lakefrontdigital.io is the marketing site for Lakefront Digital (Lakefront Digital LLC), a founder-run web design, hosting and growth business.

- **The site's job:** explain what Lakefront does, then turn visitors into a conversation.
  - That conversation is a free first consultation or a project enquiry.
  - Both arrive by email, and the founder answers.
- **Success means enquiries that become long-term hosting and management clients.** Builds, migrations and growth work matter most as the way into that relationship.
- **The blog** is for plain-English guides to SEO and content for small businesses. No article is published yet.

## Positioning

- **Lakefront runs the sites it works on.** That's true whether Lakefront built the site, took it over, or is running an app on another platform.
- **Each site runs on infrastructure Lakefront manages.** The founder keeps it updated, backed up, monitored and supported.
- **The published WordPress stack:**
  - AWS
  - Cloudflare CDN and DDoS protection
  - NGINX caching
  - Let's Encrypt SSL
  - daily Jetpack backups
  - New Relic monitoring with 24/7 alerts
  - WP Rocket and ManageWP
  - Zendesk support
- **The core offer is the ongoing hosting and management relationship.**
  - Consultations, builds, migrations and growth services all lead into it.
  - The contrast is with anyone who stops at launch: a freelancer who hands over the keys, a DIY site builder, or an agency that leaves hosting to the client.
- **The live copy still leads with "a one-stop solution".** The owner has confirmed that hosting and management is the real edge.
- **Open:** the site doesn't yet describe the stack and routine for apps and non-WordPress sites.

## Operating Context

- **Two ways to get in touch:**
  - "Book a consultation" goes to `/consultation#enquiry`. It is a desktop header button and an ordinary mobile menu link; the page owns the primary mobile action.
  - "Start a project" goes to /contact.
  - Service pages link to `/contact?service=<slug>#enquiry`, which pre-ticks that need.
  - The footer also lists the email address and phone number.
- **The consultation form** asks for name, work email, an optional phone number and notes.
- **The project form** asks for:
  - current website
  - timeline
  - needs
  - whether the site is on WordPress (Yes, No, Not sure, No site yet)
  - notes
- **Only name and email are required.** Enquiries are emailed to hello@lakefrontdigital.io, and replies go out by email.
- **Support is not a live customer workflow yet.** Zendesk is part of the intended hosting offer, but no support destination is available.
- **Content is edited in EmDash.**
  - The founder works in the admin at `/_emdash/admin`.
  - Agents change content through the site's MCP server, and only with the owner's approval.
- **Search:**
  - The header's search opens an AI search modal (Cloudflare AI Search).
  - `/search` is the full-text fallback, and it works without JavaScript.
  - Blocks aren't indexed, so each page's summary and keywords carry its search terms.
- **Menus link only to pages that exist,** by the owner's choice.
  - Three destinations are waiting on content:
    - /seo: its copy is in the design kit.
    - /work: needs a first case study.
    - The blog: needs a first full article.
  - When one of these goes live, its menu links go live with it: SEO under Services, Work, and Blog.

## Capabilities and Constraints

- **Services, as the live copy names them:**
  - Website Performance Optimization
  - Social Media Integration
  - Analytics Setup & Review (Google Analytics)
  - WordPress Website Design and Development, with e-commerce
  - SEO: keywords, link building and local SEO
  - Content Creation and Management
  - Tech Consulting
  - Small Business Hosting
  - Digital Marketing
- **The Website Consultation** covers website analysis, strategic business planning, personalized recommendations and a growth roadmap.
- **Client e-commerce** runs on WooCommerce, with PayPal and Stripe.
- **Hosting and management.** Lakefront takes on:
  - sites it builds;
  - existing WordPress sites that others built;
  - apps and non-WordPress sites.
- **Prices:**
  - Hosting and management plan prices may be published. The figures haven't been supplied, so ask when a page needs them.
  - The first consultation is free.
  - Everything else is quoted.
  - **Open:** is the full Website Consultation (analysis, plan and roadmap) free too, or a paid follow-on?
- **No checkout or online payment on this site.** Commerce is out of scope for now, so enquiries are the only conversion.
- **Content lives in EmDash, not in code.**
  - Pages are built from 11 Lakefront blocks: hero, page intro, card grid, split, steps, service tabs, spec tabs, offer, call-to-action band, service summary and enquiry form.
  - A new surface either reuses these blocks, or ships a renderer before its new block type is activated.
  - Menus, the site title, the tagline and page copy are never hard-coded.
- **Server-rendered** with Astro and EmDash on Cloudflare Workers. The site itself isn't WordPress.
- **Privacy:**
  - The site runs Cloudflare Web Analytics, which is cookieless and injected by Cloudflare.
  - It uses no advertising cookies.
  - Check what the site actually runs before writing any privacy or cookie claim.
- **Terminology:**
  - "Website Consultation" is the named offer, in title case.
  - "Book a consultation" is the button.
  - "Start a project" is the project enquiry route.

## Brand Commitments

- **Name:** Lakefront Digital, legally Lakefront Digital LLC.
  - Site: lakefrontdigital.io.
  - Contact: hello@lakefrontdigital.io and (773) 231-8020.
  - Home base: Chicago, Illinois.
- **Tagline:** "Empower Your Business Online". The owner chose it, and it's set in Site Settings.
- **Voice:**
  - "We" is the business voice. One founder does all the client work, so never claim a team, staff or colleagues.
  - Use "we" for descriptions and form messages; do not imply employees or a team.
  - Menus and interface labels use sentence case. Document titles such as "Terms and Conditions" keep title case.
  - Form messages are short and direct, such as "Tell us who to reply to."
  - The blog promises plain-English guides.
- **Chicago:** it's part of the brand's identity, in the name and the photography. It isn't a service boundary.
- **Logo:** vector crest, wordmark, lockup and horizontal lockup, in `public/brand/`.
  - The `-reversed` files are for navy backgrounds.
  - A favicon and a one-colour mark are still to come.
- **Design system:** the Lakefront Digital design system is the site's visual source, and it lives in a separate design-system project.
  - `src/styles/tokens.css` and `src/styles/site.css` are copies of it.
  - Fixes made in this repo go back to that project.

## Evidence on Hand

- **Live copy** for Home, Services, Hosting, Contact, Website Consultation, Terms and Conditions, and the Privacy Policy.
  - It lives in the CMS.
  - `seed/seed.json` mirrors it for new installs.
- **The hosting stack and specs** published on /hosting.
  - They include a stated 99.9% uptime target. That's a target, not a measured record.
- **Client sites** that can be named and linked, with permission. None has been gathered yet, and /work needs the first case study.
- **Two finished white papers:** "Optimizing Your Website for Increased Conversions" and "Leveraging Digital Marketing for Business Growth".
  - The files aren't in the repo or the media library yet.
  - Keep resource cards off the consultation page until the actual files are available.
- **Four SEO guide outlines** in `seed/seed.json`. They're drafts, too thin to publish, and wait for full articles.
- **SEO page copy** in the design kit (`ui_kits/website/SeoScreen.jsx`), outside this repo.
- **Assets:** 13 bundled photos in `public/images/`, and the brand files in `public/brand/`.
- **Nothing on this list exists. Don't invent any of it:**
  - testimonials or reviews
  - client logos
  - team members or bios
  - years in business
  - counts of clients or hosted sites
  - measured uptime
  - client results or metrics
  - awards, certifications or partner badges
  - hosting plan figures, until the owner supplies them

## Product Principles

1. **Sell the relationship, not the launch.** Lakefront's core is the hosting and management it runs. Frame the work around what happens after a site goes live, and who keeps it running.
2. **Show the machinery in plain English.** The managed stack and the routine of looking after a site set Lakefront apart. Name the real tools and explain them simply, the way the CDN and reverse-proxy tips on /hosting do, rather than making vague promises.
3. **Claims match reality.**
   - One founder does the work, so don't imply a team.
   - Proof, numbers, prices and links appear only when they're real, cleared and live.
4. **Chicago roots, national reach.** Chicago gives the brand its character, and clients can be anywhere in the US.

## Accessibility & Inclusion

- **Required:** every page and form works without JavaScript.
  - Tabs stack.
  - The enquiry forms post normally.
  - The legal table-of-contents links work.
- **Keep what's already in place:**
  - a skip link
  - visible keyboard focus
  - reduced-motion handling
  - labelled form fields, with inline errors that match the server's
  - ARIA states on the menus, tabs and forms
  - print styles for the legal pages
- **Open:** no formal standard has been confirmed, such as WCAG 2.2 AA.
