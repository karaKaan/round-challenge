Thanks for the opportunity it was a great Challenge and truly hands-on.

[challenge.webm](https://github.com/user-attachments/assets/5a2913a1-f77b-4505-86b2-915be3a9fd9e)



### Shortcuts 
1. Mobile-first approach not considered.

### Assumptions
1. EUR as the currency

### Tasks
1. [x] API(s) to get bank accounts data for frontend
2. [x] API(s) to get transactions history for frontend
3. [x] API(s) to get stats for frontend
4. [x] A database schema to store needed information for bank accounts. Actual data can be mocked
- [ ] One workflow to keep local data in sync with the bank - to keep it synced every x hours, and generate the reports
6. [x] (Bonus) A super basic barebones dashboard page with the above mockup (in NextJS or React)
7. [x] Lots of ideas on how you would build it right if you were to make it for real

Before we start I just wanted to say that I've never worked with plaid, but it was awesome. I had a lot of fun reading through the docs and implementing the solutions.

I did all the expected tasks with bonus and for Nr. 7 I will elaborate more later on. But first I would like to talk about Nr.5.

I didn't understand quite the expectation, BUT I would love to explain you my approach. 

### The approach for Nr. 5
I assume that the task is to sync the bank with our DB for every x hours. This can be solved through cronjob. When we are using Vercel for our deployment, then we can use the [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) to ping one of our api route and handle the sync there.

**Issue with this approach**

Checking, updating, and syncing the bank with each user in our database every x hours will cause a heavy load on the server, and more importantly, on the bank/Plaid, which will be costly. The worst case would be syncing it every hour.

**What is the Solution then?**

Reading through the plaid docs, I noticed that they offer many webhooks to listen too. This is way better then the cronjob, because we only change, when something is happening and only for a single user(the affected one).

### 7. Ideas

1. Develop a user onboarding process after sign up and get their bank account, but this is optional and can be skipped.
2. Use actual charts, for example Chartjs that is interactive.
3. Each card is clickable and redirect to a more detailed view.
4. Change currency
5. Different Accounts will have different currency. Apply the correct exchange rate and calculate with it in order to keep everything unified.
6. Implement User settings, permissions
7. Each Account can be deleted.
8. Each Account can be edited, for example a custom name.
9. Add Credentials login





