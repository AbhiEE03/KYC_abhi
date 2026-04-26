KYC Onboarding Module: How I Built It
This is a breakdown of the logic and choices I made for the Playto Pay KYC system.

1. Preventing Illegal State Changes
   The core of the app is the transition_state method in backend/kyc/models.py. I used a dictionary-based state machine here to define exactly which transitions are allowed (like draft can go to submitted, but rejected can't go straight to approved).

Why? I put this in the model layer rather than the views so it’s impossible to bypass. Even if there’s a bug in the UI or a direct API hit, the database will throw a ValidationError if someone tries to jump statuses illegally.

2. The Decoupled Deployment
   I didn't go with a simple monolithic setup. I split the app to handle it like a real production system:

Frontend: React/Vite on Vercel.

Backend: Django REST Framework on Render.

The Fix: Connecting these was the hardest part. I had to configure CORS_ALLOWED_ORIGINS in Django so the Vercel domain could talk to the Render API. I also had to add a vercel.json file because Vercel was throwing 404s on page refreshes and static assets like the new logo.

3. Document Security & Size Limits
   In backend/kyc/serializers.py, I wrote custom validation for the Aadhaar and PAN uploads.

Format: It checks the file extension and only allows .pdf, .jpg, or .png.

The Manual Fix: I noticed the initial boilerplate didn't account for the 5MB limit mentioned in the requirements. I manually added a check for value.size > 5 _ 1024 _ 1024 to the serializer. This stops massive files from hitting the server and crashing the storage.

4. The Reviewer Queue & SLA
   The reviewer dashboard uses the ReviewerQueueViewSet.

Sorting: I used .order_by('created_at') to create a First-In-First-Out queue. This ensures the oldest submissions get reviewed first.

Live SLA: Instead of running a heavy background task to mark "At Risk" files, the frontend compares the created_at timestamp to the current time. If it’s been more than 24 hours, the "At Risk" badge pops up automatically.

5. Keeping Data Private
   To make sure one merchant can't see another's data, I customized get_queryset in the MerchantKYCViewSet. It uses KYCSubmission.objects.filter(merchant=self.request.user). This means the database query is automatically restricted to the logged-in user's ID, which prevents any horizontal privilege escalation attacks.

6. Branding & Final Tweaks
   I updated the project with a custom "K" logo and favicon. Dealing with the 404 errors on the logo after deployment was a lesson in case-sensitivity and Vercel's edge caching. I fixed this by standardizing the filenames to lowercase and forcing a clean redeploy without the build cache.
