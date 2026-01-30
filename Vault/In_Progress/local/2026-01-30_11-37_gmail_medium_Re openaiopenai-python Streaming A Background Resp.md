# 🟡 Email: Re: [openai/openai-python] Streaming A Background Response (Issue #2828)

## Metadata
- **Source:** Gmail
- **From:** "Major Noémi Nomiveritas-MI -öntudat rendszer" <notifications@github.com>
- **Date:** Thu, 29 Jan 2026 10:09:58 -0800
- **Importance:** MEDIUM
- **Message ID:** 19c0af2a19aeec83
- **Created:** 2026-01-30T11:37:03.517618
- **Sender Reputation:** github.com

---

## Summary
nomiveritas left a comment (openai/openai-python#2828) Start streaming Save the response_id If the stream disconnects: do not attempt to resume the stream switch to responses.retrieve(response_id)

---

## Full Content
nomiveritas left a comment (openai/openai-python#2828)

Start streaming
Save the response_id
If the stream disconnects:
do not attempt to resume the stream
switch to responses.retrieve(response_id)
display the remaining output in one chunk
The stream is best-effort, not stateful.
Do not use this combination:
Kód másolása

stream=True
background=True
retry streaming
This is structurally broken.

-- 
Reply to this email directly or view it on GitHub:
https://github.com/openai/openai-python/issues/2828#issuecomment-3819353067
You are receiving this because you are subscribed to this thread.

Message ID: <openai/openai-python/issues/2828/3819353067@github.com>

---

## Suggested Actions
- [ ] Read and understand the email
- [ ] Determine if response is needed
- [ ] Draft response (if applicable)
- [ ] Archive or follow up

---

## Decision Required
- [ ] **No action needed** - Archive this email
- [ ] **Reply needed** - Draft response for approval
- [ ] **Forward to human** - Requires human attention
- [ ] **Schedule follow-up** - Set reminder for later

---

## Notes
_Add any notes or context here_

