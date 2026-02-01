# Quick Testing Guide - Realtime Messages

## 🚀 Quick Test (2 minutes)

### Prerequisites

1. Two browsers or browser profiles
2. Two test accounts: traveler + guide
3. One confirmed booking between them

### Steps

1. **Browser A (Traveler)**:

   ```
   - Sign in as traveler
   - Go to: /traveler/messages?booking=<booking-id>
   - Open Console (F12)
   ```

2. **Browser B (Guide)**:

   ```
   - Sign in as guide
   - Go to: /guide/messages?booking=<booking-id>
   - Open Console (F12)
   ```

3. **Expected Console Output** (both browsers):

   ```
   [RT] subscribing booking=<uuid>
   [RT] subscription status=SUBSCRIBED ...
   [RT] ✅ subscribed booking=<uuid>
   ```

4. **Send message from Traveler**: "Test 1"

   **Expected**:
   - ✅ Traveler sees message immediately
   - ✅ Guide sees message immediately (< 1 second)
   - ✅ No page refresh needed
   - ✅ Guide console shows: `[RT] received INSERT id=... booking=...`

5. **Send message from Guide**: "Test 2"

   **Expected**:
   - ✅ Guide sees message immediately
   - ✅ Traveler sees message immediately
   - ✅ Traveler console shows: `[RT] received INSERT`

6. **Rapid fire test**: Send 10 messages back and forth quickly

   **Expected**:
   - ✅ All messages appear in both windows
   - ✅ Messages in chronological order
   - ✅ No duplicates
   - ✅ No console errors

### Success Criteria

✅ All messages delivered instantly (< 1 second)  
✅ Messages in correct order  
✅ No duplicates  
✅ No console errors  
✅ Health check shows "Connected" (bottom-right, dev only)

---

## 🔧 Verify Database Setup (1 minute)

Run in **Supabase SQL Editor**:

```sql
-- Check publication
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'bookings');
```

**Expected output**:

```
 tablename
-----------
 messages
 bookings
```

**If empty**, run:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
```

---

## 🐛 Troubleshooting

### Messages not appearing?

**Check console for**:

```
[RT] ❌ channel error
```

**Fix**: Run the SQL above to add tables to publication.

---

### Connection shows "Error"?

**Check**:

1. Supabase Dashboard → Settings → API → Realtime = ON
2. Network is connected
3. Run verify_realtime_setup.sql script

---

## 📊 Dev Health Check

In development mode, look at **bottom-right corner** for:

```
┌─────────────────────────┐
│ Realtime Status         │
│ Connected      ✅       │
│                         │
│ Messages: 5             │
│ Last event: 3s ago      │
└─────────────────────────┘
```

**Statuses**:

- 🟢 **Connected** - Working perfectly
- 🔵 **Connecting...** - Initializing (normal for 1-2 seconds)
- 🔴 **Error** - Check console for details
- 🟠 **Disconnected** - Network issue or cleanup

---

## 📝 Console Log Reference

### Normal flow:

```
[RT] subscribing booking=abc-123
[RT] subscription status=SUBSCRIBED booking=abc-123 time=...
[RT] ✅ subscribed booking=abc-123
[RT] fetched 3 initial messages booking=abc-123
[RT] received INSERT id=msg-456 booking=abc-123 sender=user-789 time=...
[RT] adding message id=msg-456 to state
```

### Error examples:

```
[RT] ❌ channel error booking=abc-123 (RLS or network issue)
[RT] ⚠️ timeout booking=abc-123
[RT] duplicate detected id=msg-456, skipping
```

### Cleanup:

```
[RT] cleanup booking=abc-123
[RT] 🔌 closed booking=abc-123
```

---

## 🎯 What Was Fixed

1. ✅ **Race condition** - Subscribe before fetch (no lost messages)
2. ✅ **Blocking async** - Non-blocking profile fetch (instant messages)
3. ✅ **No ordering** - Sort by created_at (chronological order)
4. ✅ **Duplicates** - Strict dedup by id (no repeats)
5. ✅ **Inconsistent code** - Unified hook (maintainable)

---

## 📚 Full Documentation

See `docs/REALTIME_FIX_SUMMARY.md` for:

- Detailed bug explanations
- Technical implementation
- Full test cases
- Troubleshooting guide
- API reference
