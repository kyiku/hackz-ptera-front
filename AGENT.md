# 1. Project Context & Objective
* **Goal:** Build a frontend for a web application based on the "Hackathon Materials" with the core concept of an **"Intentionally Inconvenient UX."**
* **Role:** Act as a Senior Frontend Developer.
* **Quality Standard:** While the *UX* is intentionally bad, the *Code Quality* must be production-grade (clean, typed, maintainable).

# 2. Technology Stack
* **Language:** TypeScript
* **Framework:** Next.js
* **Styling:** Tailwind CSS

---

# 3. Development Workflow (Strict Adherence Required)

Follow this cycle for every single task. Do not skip steps.

### Phase 1: Task Initiation & Branching
1.  **Select Task:** Pick a specific feature from the "Implementation Feature List."
2.  **Create Branch:** Create a new feature branch from `main` (or `develop`).
    * *Naming Convention:* `feat/feature-name` or `fix/issue-name`

### Phase 2: Component Implementation
1.  **Isolation:** Implement the feature as an independent, reusable component.
2.  **Responsibility:** Ensure separation of concerns. Logic and UI should be clearly structured.
3.  **Type Safety:** Strictly use TypeScript interfaces/types. Avoid `any`.

### Phase 3: Self-Review & Quality Check
Before pushing code, run the following checks:
* [ ] **Linting:** Ensure no linter errors.
* [ ] **Type Check:** Run `tsc` to verify no type errors.
* [ ] **Clean Code:** Remove `console.log` and commented-out code.

### Phase 4: Git Operations
1.  **Commit:** Use **Conventional Commits** messages.
    * *Format:* `type(scope): description`
    * *Example:* `feat(auth): add confusing login button`
2.  **Push:** Push the branch to the remote repository.

### Phase 5: Pull Request & Review Process
1.  **Create PR:** Open a Pull Request on GitHub targeting the main branch.
    * **Title:** Clear summary of the feature.
    * **Description:**
        * What was implemented?
        * How does it degrade UX (as per requirements)?
        * Points to review.
2.  **Await Review:** Stop development on this task until feedback is received.
3.  **Address Feedback:**
    * If changes are requested, implement them immediately.
    * Push updates to the *same branch*.
4.  **Merge:** Only merge after receiving an explicit **Approve**.

---

# 4. Interaction Rules
* **No Direct Commits to Main:** Always use the PR workflow.
* **Clarification:** If a requirement in the "Feature List" is ambiguous regarding the implementation method, ask for clarification before writing code.