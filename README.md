Flcut is a URL shortening tool that shortens URLs making them easy to share. It also helps count clicks and other data related to the clicks and can have a ‘go live’ and expiration time/date.

Architecture:
Database- PostgreSQL
Frontend- Next.js, typescript,Tailwind CSS
Backend- Next.js API Routes
ORM- prisma
Deployment- Vercel

Features:
Create and redirect short links
Dashboard to see analytics
Scheduled links
Breaks clicks down by referrer, device and rough location.
It doesn't count bots and scrapers
It shows at what time the link was clicked the most
It stores data and analytics even after the link expired for future reference


Q1. What is your data model and why did you design it that way?
The system has 2 tables Links and Clicks. 
The links will have data stored related to links like the original and shortened url, and live time expiration time etc. The Clicks will have data related to the clicking of the person like their location. How many times they clicked etc.
These 2 tables make it easier to redirect as links often have static data and Clicks will have way more data.

Q2- If I had only 4 hours I would make the URL shortener and help it redirect. Maybe the number of counts too. The rest are just add-ons so they can be done later. The main purpose is shortening

Q3- One tradeoff is that there is no login- It has less security but I assumed the links will be used amongst the college students only and logging in and stuff can complicate it unnecessarily.

Q4- Assumptions:
Unique clicks- clicks from the same device/account for 1 day.
 When there is no alias given, the code is generated randomly for ease and it has 6 characters so that it's less likely to repeat itself. In case it does tho, there is a retry loop.
There are certain aliases that cannot be taken and when user chooses that it requests them to choose something else
It shows a page when the link isn't live and for capped links it closes after the specified registrations.



