import type { DesignSystemPhase } from "@/types/phases";

export function generateDesignMd(
  projectName: string,
  ds: DesignSystemPhase,
): string {
  const lines: string[] = [];
  const push = (line: string) => lines.push(line);
  const nl = () => lines.push("");

  push(`# DESIGN.md — ${projectName}`);
  nl();

  // § 1
  push("## 1. Visual Theme & Atmosphere");
  nl();
  push(ds.visualTheme.mood || "_분위기 미정_");
  nl();
  push(`- **Density**: ${ds.visualTheme.density}`);
  push(`- **Philosophy**: ${ds.visualTheme.philosophy || "-"}`);
  nl();

  // § 2
  push("## 2. Color Palette & Roles");
  nl();
  if (ds.colorPalette.length > 0) {
    push("| Name | Hex | Role |");
    push("| --- | --- | --- |");
    ds.colorPalette.forEach((c) => {
      push(`| ${c.name} | ${c.hex} | ${c.role} |`);
    });
  } else {
    push("_컬러 팔레트 미정_");
  }
  nl();

  // § 3
  push("## 3. Typography Rules");
  nl();
  if (ds.typography.fontFamilies.length > 0) {
    push("**Font Families**:");
    ds.typography.fontFamilies.forEach((f) => {
      push(`- ${f.role}: ${f.family} (fallback: ${f.fallback})`);
    });
    nl();
  }
  if (ds.typography.scale.length > 0) {
    push("| Level | Size | Weight | Line Height |");
    push("| --- | --- | --- | --- |");
    ds.typography.scale.forEach((s) => {
      push(`| ${s.name} | ${s.size} | ${s.weight} | ${s.lineHeight} |`);
    });
  }
  nl();

  // § 4
  push("## 4. Component Stylings");
  nl();
  if (ds.components.length > 0) {
    ds.components.forEach((c) => {
      push(`### ${c.component}`);
      nl();
      push(c.variants);
      nl();
      push(`- Border radius: ${c.borderRadius}`);
      if (c.notes) push(`- Notes: ${c.notes}`);
      nl();
    });
  }

  // § 5
  push("## 5. Layout Principles");
  nl();
  if (ds.layout.spacingScale.length > 0) {
    push(`- Spacing scale: ${ds.layout.spacingScale.join(", ")}`);
  }
  push(
    `- Grid: ${ds.layout.gridColumns} columns, max-width ${ds.layout.maxContentWidth}`,
  );
  push(`- Whitespace: ${ds.layout.whitespacePhilosophy || "-"}`);
  nl();

  // § 6
  push("## 6. Depth & Elevation");
  nl();
  if (ds.elevation.shadows.length > 0) {
    push("| Level | Shadow | Usage |");
    push("| --- | --- | --- |");
    ds.elevation.shadows.forEach((s) => {
      push(`| ${s.level} | ${s.value} | ${s.usage} |`);
    });
    nl();
  }
  if (ds.elevation.surfaceHierarchy) {
    push(ds.elevation.surfaceHierarchy);
    nl();
  }

  // § 7
  push("## 7. Do's and Don'ts");
  nl();
  ds.guidelines.dos.forEach((d) => push(`✅ Do: ${d}`));
  ds.guidelines.donts.forEach((d) => push(`❌ Don't: ${d}`));
  nl();

  // § 8
  push("## 8. Responsive Behavior");
  nl();
  if (ds.responsive.breakpoints.length > 0) {
    push("| Breakpoint | Min Width |");
    push("| --- | --- |");
    ds.responsive.breakpoints.forEach((b) => {
      push(`| ${b.name} | ${b.minWidth} |`);
    });
    nl();
  }
  push(`- Touch target: ${ds.responsive.touchTargetMin}`);
  push(`- Collapsing: ${ds.responsive.collapsingStrategy || "-"}`);
  nl();

  // § 9 Agent Prompt Guide (auto-generated)
  push("## 9. Agent Prompt Guide");
  nl();
  push("### Quick Color Reference");
  nl();
  if (ds.colorPalette.length > 0) {
    ds.colorPalette.forEach((c) => {
      push(`- **${c.name}**: \`${c.hex}\` — ${c.role}`);
    });
    nl();
  }
  push("### Component Summary");
  nl();
  if (ds.components.length > 0) {
    ds.components.forEach((c) => {
      push(`- **${c.component}**: border-radius ${c.borderRadius}`);
    });
    nl();
  }
  push("### UX Writing");
  nl();
  push(`- Tone level: ${ds.uxWriting.toneLevel}/5`);
  push(`- Error style: ${ds.uxWriting.errorMessageStyle}`);
  if (ds.uxWriting.glossary.length > 0) {
    push("- Glossary:");
    ds.uxWriting.glossary.forEach((g) => {
      push(`  - Use "${g.term}" instead of "${g.avoid}"`);
    });
  }

  return lines.join("\n");
}
