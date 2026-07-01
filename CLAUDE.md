# Agent Instructions
> Generic project template with GHL + n8n integration, skill invocation, and self-annealing architecture.
> Copy this to your project root as `CLAUDE.md` and fill in the project-specific sections.

You operate within a 3-layer architecture that separates concerns to maximize reliability. LLMs
are probabilistic, whereas most business logic is deterministic and requires consistency. This
system fixes that mismatch.

---

## The 3-Layer Architecture

**Layer 1: Directive (What to do)**
- SOPs written in Markdown, live in `directives/`
- Define the goals, inputs, tools/scripts to use, outputs, and edge cases
- Natural language instructions, like you'd give a mid-level employee

**Layer 2: Orchestration (Decision making)**
- This is you. Your job: intelligent routing.
- Read directives, call execution tools in the right order, handle errors, ask for clarification,
  update directives with learnings
- You're the glue between intent and execution. You don't do work directly — you read the
  directive and run the right script.

**Layer 3: Execution (Doing the work)**
- Deterministic Python scripts in `execution/`
- Environment variables and API tokens stored in `.env`
- Handle API calls, data processing, file operations, database interactions
- Reliable, testable, fast. Use scripts instead of manual work.

**Why this works:** if you do everything yourself, errors compound. 90% accuracy per step =
59% success over 5 steps. Push complexity into deterministic code so you can focus on decisions.

---

## Operating Principles

**1. Check for tools first**
Before writing a script, check `execution/` per your directive. Only create new scripts if none exist.

**2. Self-anneal when things break**
- Read error message and stack trace
- Fix the script and test it again (unless it uses paid tokens/credits — check with user first)
- Update the directive with what you learned (API limits, timing, edge cases)

**3. Update directives as you learn**
Directives are living documents. When you discover API constraints, better approaches,
common errors, or timing expectations — update the directive. Don't create or overwrite
directives without asking unless explicitly told to.

**Self-annealing loop:**
1. Fix it
2. Update the tool
3. Test — make sure it works
4. Update directive with new flow
5. System is now stronger

---

## Skill Invocation

Skills are installed globally at `~/.claude/skills/` and are available in every project.
**Invoke a skill before doing work that falls in its domain** — don't guess at APIs or patterns
when a skill has confirmed working knowledge.

| Skill | When to invoke |
|---|---|
| `ghl-api-expert` | Any GHL API call — contacts, opps, pipelines, custom fields, custom objects, associations, forms, workflows |
| `n8n-expert` | Building or debugging any n8n workflow |
| `n8n-code-javascript` | Writing JavaScript in n8n Code nodes |
| `n8n-code-python` | Writing Python in n8n Code nodes |
| `n8n-expression-syntax` | Writing n8n `={{ }}` expressions |
| `n8n-mcp-tools-expert` | Using MCP tools to manage n8n via API |
| `n8n-node-configuration` | Configuring specific n8n node types |
| `n8n-validation-expert` | Debugging n8n validation errors |
| `n8n-workflow-patterns` | Designing new workflow architecture |
| `della-expert` | Della platform operations |
| `claude-api` | Building apps with the Anthropic SDK |

Use the `Skill` tool to invoke: `Skill({ skill: "ghl-api-expert" })` before making GHL API calls,
`Skill({ skill: "n8n-expert" })` before building workflows, etc.

---

## Project Setup

When asked to set up this project (e.g. "use @CLAUDE.md to set up the file structure and pull
the skill repo"), do the following in order — don't skip steps even if some already look done:

1. **Create the directory structure** described in File Organization below, if it doesn't
   already exist: `directives/`, `execution/`, `.tmp/`, `.gitignore`, `.env` (copy from
   `.env.example` if one is present, otherwise create from the template in this file).
2. **Pull/update the skill library** by running the setup script that ships alongside this
   file in the project root:
   ```bash
   bash setup_skills.sh
   ```
   This script is idempotent — safe to run even if `~/.claude/skills` already exists and is
   current. If `setup_skills.sh` is missing from this project folder, stop and ask the user
   for it rather than guessing at clone behavior.
3. **Report results** — confirm what was created, what was pulled/updated, and surface any
   errors from the script rather than silently continuing past a failure (e.g. uncommitted
   local changes blocking a pull, auth failures on clone).

This is a one-time-per-environment step, but safe to re-run any time you want to confirm the
project structure is intact and skills are current.

---

## File Organization

**Directory structure:**
```
project-root/
├── CLAUDE.md                  # This file
├── setup_skills.sh            # Clones/updates ~/.claude/skills from skill-library repo
├── .env                       # API keys and environment variables (never commit)
├── .gitignore                 # Must include .env, .tmp/, credentials.json, token.json
├── .tmp/                      # Intermediate files — always regenerated, never committed
├── execution/                 # Deterministic Python scripts
│   ├── ghl_client.py          # GHL API operations
│   └── *.py                   # Other execution scripts
├── directives/                # SOPs in Markdown
│   ├── ghl_operations.md      # GHL-specific operations
│   └── *.md                   # Other directives
└── credentials.json           # Google OAuth (if needed, in .gitignore)
```

**Key principle:** Local files are for processing only. Deliverables live in cloud services
(Google Sheets, Slides, GHL, etc.) where the user can access them. Everything in `.tmp/`
can be deleted and regenerated.

**Required `.env` variables:**
```
GHL_API_KEY=your_api_key_here
GHL_LOCATION_ID=your_location_id_here
N8N_API_URL=https://your-n8n-instance.up.railway.app
N8N_API_KEY=your_n8n_api_key_here
```

---

## GHL Integration

**Module:** `execution/ghl_client.py` — always use this for GHL operations instead of raw API calls.

**Available operations:**
- Contact management (create, update, search, delete)
- Opportunity management (create, update, move stages)
- Communication (SMS, email via conversations API)
- Tags and custom fields
- Pipeline and stage operations
- Custom object records (create, update, search, delete)
- Association types and instances

**Self-annealing checklist when GHL fails:**
- [ ] Check error type (rate limit? auth? invalid field format?)
- [ ] Update `ghl_client.py` with better error handling
- [ ] Test fix with a simple operation
- [ ] Update `directives/ghl_operations.md` with new learnings

### Confirmed Working API Patterns

**Contacts**
- Search: `GET /contacts/?locationId={loc}&query={q}`
- Get by ID: `GET /contacts/{id}`
- Update: `PUT /contacts/{id}` body `{ customFields: [{ id, field_value }] }`
- Custom field write key: `field_value` (not `value`) for contact fields

**Opportunities**
- Search: `GET /opportunities/search?location_id={loc}&q={name}`
- Get by ID: `GET /opportunities/{id}` — required for numeric custom field values
- Create: `POST /opportunities/` body `{ locationId, pipelineId, pipelineStageId, contactId, name, status }`
- Update: `PUT /opportunities/{id}` body `{ pipelineId, pipelineStageId, customFields: [{ id, value }] }`
- Delete: `DELETE /opportunities/{id}`
- Custom field write key: `value` (not `field_value`) for opportunity fields

**Custom Object Records**
- Create: `POST /objects/{key}/records` body `{ "locationId": loc, "properties": { ... } }` — locationId top-level
- Update: `PUT /objects/{key}/records/{id}?locationId={loc}` body `{ "properties": { ... } }`
- Delete: `DELETE /objects/{key}/records/{id}` — NO locationId param (causes 422)
- Search: `POST /objects/{key}/records/search` body `{ locationId, page, pageLimit, query: "field:value" }`

**Association Instances**
- Create type (one-time): `POST /associations/` body `{ locationId, key, firstObjectLabel, firstObjectKey, secondObjectLabel, secondObjectKey }`
- Link records: `POST /associations/relations` body `{ locationId, associationId: "<typeId>", firstRecordId, secondRecordId }`
- `associationId` = the type `id` returned from type creation — NOT `associationTypeId`
- Dead endpoints (all 404): `/associations/{typeId}`, `/associations/instances`, `/objects/{key}/records/{id}/associations`

**Conversations / Email**
- Send email: `POST /conversations/messages` body `{ type: 'Email', conversationId, contactId, subject, body, html, emailTo, emailFrom }`
- Get messages: `GET /conversations/{id}/messages`

**Forms**
- Pre-link to contact: append `?contact_id={contactId}` to form URL — without this GHL creates a new contact
- NO spaces between URL parameters — spaces before `&` break URL encoding in GHL templates

---

## n8n Integration

**MCP tools** are available for managing n8n workflows via API. Use `mcp__n8n__*` tools for:
- Creating and updating workflows
- Checking execution history
- Patching node fields

**Critical n8n patterns:**
- Webhook nodes require `typeVersion: 2.1` (not 2.0) for proper registration
- HTTP Request nodes require `sendBody: true` + `contentType: 'json'` for POST/PUT bodies to send
- Use `$('NodeName').first().json.field` for cross-node references — `$json` resets after each HTTP node
- Bash `$(...)` is command substitution — write Python scripts to files and run with `python script.py`
  rather than inline `-c` when the code contains `$()` expressions

**n8n environment variables:**
```
N8N_API_URL=https://your-n8n-instance.up.railway.app
N8N_API_KEY=your_n8n_key
```

---

## GitHub Integration

Use the `gh` CLI for all GitHub operations:
```bash
gh repo clone owner/repo          # Clone a repo
gh pr list                        # List open PRs
gh pr create --title "..." --body "..."
gh issue list
gh issue create --title "..." --body "..."
```

**Project repos** (fill in for this project):
```
# PRIMARY_REPO=owner/repo-name
# Add repo URLs here as you set them up
```

---

## GHL Directive Template

All GHL operations should have a directive in `directives/`. Use this structure:

```markdown
# GHL: [Operation Name]

## Goal
[What this operation accomplishes]

## Inputs
- field_name (required/optional) — description

## Execution Tool
`execution/ghl_client.py::[function_name]()`

## Output
[What is returned]

## Edge Cases
- [Known edge case]: [How it's handled]

## Self-Annealing Notes
- [YYYY-MM-DD]: [What was learned]
```

---

## Project-Specific Configuration

> Fill in this section when setting up a new project.

**Project name:** [PROJECT NAME]

**GHL Location:** [LOCATION NAME]
- Location ID: `[LOCATION_ID]`
- Sub-account URL: `[URL]`

**n8n instance:** `[N8N_URL]`

**Key pipelines:**
| Pipeline | ID |
|---|---|
| [Pipeline Name] | `[ID]` |

**Key stage IDs:**
| Stage | Pipeline | ID |
|---|---|---|
| [Stage Name] | [Pipeline] | `[ID]` |

**Key custom field IDs:**
| Field | Object | ID |
|---|---|---|
| [field.name] | contact/opportunity | `[ID]` |

**Active n8n workflows:**
| Name | ID | Webhook |
|---|---|---|
| [Workflow Name] | `[ID]` | `[URL]` |

---

## Summary

You sit between human intent (directives) and deterministic execution (Python scripts).
Read instructions, make decisions, call tools, handle errors, continuously improve the system.

- Invoke skills before working in their domain
- Use `execution/ghl_client.py` for all GHL operations
- Keep directives updated with API learnings
- Self-anneal on every error

Be pragmatic. Be reliable. Self-anneal.
