# Orchestrator Fix Summary

## Problem Diagnosis

The Digital FTE Orchestrator was failing to communicate properly with Claude Code CLI. The logs showed:

```
2026-01-30 11:21:25,054 - Orchestrator - WARNING - Agent did not provide target_folder.
Data: {'role': 'json_generator', 'capabilities': [...], 'status': 'ready', 'awaiting': 'user_request'}
```

**Root Causes:**

1. **Confusing Prompt**: The original prompt started with "You are a JSON generator. You do not speak..." which caused Claude to describe itself as a JSON generator instead of analyzing the task.

2. **Missing CLI Flags**: The orchestrator wasn't using Claude Code's `--output-format json` flag, which causes Claude to wrap responses in a structured format.

3. **Inadequate JSON Parsing**: The parser couldn't handle Claude Code's JSON output format which wraps content in:
   ```json
   {
     "content": [{"type": "text", "text": "...actual JSON..."}]
   }
   ```

## Fixes Applied

### 1. Improved Prompt (orchestrator.py:265-295)

**Before:**
```python
prompt = f"""You are a JSON generator. You do not speak. You do not greet. You only output valid JSON.
...
"""
```

**After:**
```python
prompt = f"""Analyze this task and determine if it needs human approval. Return ONLY valid JSON, nothing else.
...
IMPORTANT: Respond with ONLY this JSON structure, no other text:
{{
  "decision": "APPROVE",
  "target_folder": "Done",
  "analysis": "Brief analysis..."
}}
...
OUTPUT ONLY THE JSON, NOTHING ELSE."""
```

### 2. Added Claude CLI Flags (orchestrator.py:74-79)

Added proper flags for Claude Code CLI:
- `--output-format json`: Structured JSON output
- `--no-session-persistence`: Prevent session file creation

```python
{
    "name": "claude",
    "commands": ["claude", "claude.cmd", ...],
    "prompt_flag": "-p",
    "extra_flags": ["--output-format", "json", "--no-session-persistence"],
    "enabled": True
},
```

### 3. Enhanced JSON Parsing (orchestrator.py:326-383)

Added multi-strategy JSON parsing:

1. **Primary**: Parse Claude Code's `--output-format json` structure
2. **Fallback**: Extract JSON from markdown code blocks
3. **Validation**: Detect and reject self-description responses

```python
# Check for Claude Code --output-format json structure
if 'content' in parsed_response and isinstance(parsed_response['content'], list):
    # Extract text from content blocks
    for block in parsed_response['content']:
        if block.get('type') == 'text':
            text_content += block.get('text', '')
    data = json.loads(text_content.strip())
```

### 4. Updated Command Building (orchestrator.py:312-324)

Properly construct CLI commands with extra flags:

```python
cmd = [command]
if prompt_flag:
    cmd.append(prompt_flag)
if extra_flags:
    cmd.extend(extra_flags)  # --output-format json --no-session-persistence
cmd.append(prompt)
```

## Expected Behavior

Now when the orchestrator processes a task:

1. **Claim**: Move task from `Needs_Action` to `In_Progress/local`
2. **Analyze**: Call Claude with proper flags: `claude -p --output-format json --no-session-persistence "prompt"`
3. **Parse**: Extract JSON from Claude's response structure
4. **Execute**: Move task to `Done` or `Pending_Approval` based on decision
5. **Log**: Record action in audit logs

## Testing

To test the fix:

```bash
cd "E:\WEB DEVELOPMENT\Hacathan_2"
python src/orchestrator.py
```

The orchestrator should now:
- ✅ Successfully invoke Claude Code
- ✅ Parse JSON responses correctly
- ✅ Process tasks without "Agent did not provide target_folder" warnings
- ✅ Move tasks to appropriate folders

## Files Modified

- `src/orchestrator.py`: All fixes applied
  - Lines 63-115: Agent configuration with extra_flags
  - Lines 213-236: Agent discovery updated
  - Lines 265-295: Improved prompt
  - Lines 312-324: Command building with extra flags
  - Lines 326-383: Enhanced JSON parsing

## Next Steps

1. Restart the orchestrator service
2. Monitor logs for successful task processing
3. Verify tasks are being moved to correct folders
4. Check that Claude is no longer returning self-descriptions

---

*Fixed: 2026-01-30*
