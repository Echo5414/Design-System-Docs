# Design-System-Docs


UI and Styling
- Use Tailwind CSS for utility-first styling approach.
- Leverage Shadcn components for pre-built, customizable UI elements.
- Import Shadcn components from `$lib/components/ui`.
- Organize Tailwind classes using the `cn()` utility from `$lib/utils`.
- Use Svelte's built-in transition and animation features.

Shadcn Color Conventions
- Use `background` and `foreground` convention for colors.
- Define CSS variables without color space function:
  ```css
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  ```
- Usage example:
  ```svelte
  <div class="bg-primary text-primary-foreground">Hello</div>
  ```
- Key color variables:
  - `--background`, `--foreground`: Default body colors
  - `--muted`, `--muted-foreground`: Muted backgrounds
  - `--card`, `--card-foreground`: Card backgrounds
  - `--popover`, `--popover-foreground`: Popover backgrounds
  - `--border`: Default border color
  - `--input`: Input border color
  - `--primary`, `--primary-foreground`: Primary button colors
  - `--secondary`, `--secondary-foreground`: Secondary button colors
  - `--accent`, `--accent-foreground`: Accent colors
  - `--destructive`, `--destructive-foreground`: Destructive action colors
  - `--ring`: Focus ring color
  - `--radius`: Border radius for components