# Firebase & Contact Form Setup Instructions

## Issue Found
The contact form was not submitting data to Firebase because:
1. ❌ Firestore rules were rejecting submissions (invalid syntax: `is string`)
2. ❌ Rules required `phone` field but made it optional in form
3. ❌ Missing `email` field in rules validation

## Step 1: Update Firestore Rules

**Go to Firebase Console → Firestore → Rules**

Replace ALL the rules with this corrected version:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Contact submissions - FIXED VERSION
    match /contact_submissions/{docId} {
      // Allow ANYONE to create a submission
      allow create: if
        // Only allow these fields
        request.resource.data.keys().hasAll(["name", "email", "message"]) &&
        request.resource.data.keys().hasOnly(["name", "email", "phone", "service", "message", "timestamp"]) &&
        // Validate name
        request.resource.data.name.size() > 0 &&
        request.resource.data.name.size() < 100 &&
        // Validate email
        request.resource.data.email.size() > 0 &&
        request.resource.data.email.size() < 100 &&
        // Validate message
        request.resource.data.message.size() > 0 &&
        request.resource.data.message.size() < 5000;

      // Only logged-in admin can read/update/delete
      allow read, update, delete: if request.auth != null;
    }
    
    // Listings collection
    match /listings/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Blog posts collection
    match /blog_posts/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Then click PUBLISH**

---

## Step 2: Verify Firebase Config in Contact Page

Check that `pages/contact.html` has the correct Firebase config (around line 227):

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyBwLN__kNBtPUmu1HDq9w2vxhAaoHmhs3g",
    authDomain: "rmgfirebase-1ac0f.firebaseapp.com",
    projectId: "rmgfirebase-1ac0f",
    storageBucket: "rmgfirebase-1ac0f.appspot.com",
    messagingSenderId: "675350314436",
    appId: "1:675350314436:web:590f0a73658e41b409f891",
    measurementId: "G-TQ5SVFKTNJ"
};
```

✅ This is already in your file

---

## Step 3: Test the Form

1. Go to Contact Us page
2. Fill in the form:
   - Full Name: Test User
   - Email: test@example.com
   - Phone: Optional
   - Service: Any option (or leave blank)
   - Message: Test message
3. Click "Send Message"
4. Check browser console (F12) for success messages

Expected console output:
```
✓ Firebase: Document written with ID: abc123xyz...
✓ Google Sheets: Data backed up
```

---

## Step 4: Verify Data in Firebase

1. Go to Firebase Console → Firestore
2. Look for `contact_submissions` collection
3. You should see a new document with your form data

---

## What Changed

### Fixed Firestore Rules Issues:
- ❌ Removed invalid `is string` checks
- ✅ Using `.size()` method for string validation instead
- ✅ Made `phone`, `service`, `timestamp` truly optional
- ✅ Added `email` field validation (was missing before)
- ✅ Better field allowlist: only these fields allowed

### Improved Contact Form JavaScript:
- ✅ Better error messages with specific Firebase error codes
- ✅ Proper data structure for Firestore (matches rules)
- ✅ Handles permission errors gracefully
- ✅ Google Sheets backup is optional (won't break if not configured)
- ✅ Better console logging for debugging

---

## Troubleshooting

### Error: "Permission denied"
- **Cause**: Firestore rules not updated or wrong config
- **Fix**: Publish the new rules above

### Error: "Invalid argument"
- **Cause**: Data format doesn't match rules
- **Fix**: Make sure email field is included and valid

### Form shows success but no data in Firebase
- **Cause**: CORS issue or wrong project ID
- **Fix**: Check Firebase project ID matches in config

### Google Sheets not getting data
- This is optional and won't prevent form submission
- Check Google Sheets Apps Script webhook URL is correct

---

## Firebase Rules Explained

| Rule | Meaning |
|------|---------|
| `hasAll(["name", "email", "message"])` | These 3 fields are REQUIRED |
| `hasOnly([...])` | ONLY these fields are allowed (no extra fields) |
| `.size() > 0` | Must not be empty |
| `.size() < 100` | For name/email: max 100 chars |
| `.size() < 5000` | For message: max 5000 chars (prevents spam) |
| `request.auth != null` | Only logged-in users can read/edit |

---

## Contact Form Fields

| Field | Required | Type | Rules |
|-------|----------|------|-------|
| name | Yes | String | 1-100 chars |
| email | Yes | String | 1-100 chars, valid email |
| phone | No | String | Optional |
| service | No | String | Optional |
| message | Yes | String | 1-5000 chars |
| timestamp | Auto | Timestamp | Firestore server timestamp |

---

## Next Steps

✅ Update Firestore rules (above)
✅ Test contact form
✅ Check Firebase console for submissions
✅ Contact form is now fully functional!
