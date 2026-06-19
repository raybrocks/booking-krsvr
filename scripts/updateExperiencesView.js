const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../components/ExperiencesView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add helper function right after the component declaration
const helperFunc = `
  const getTypeSlug = (exp: any) => exp.experienceType?.slug || slugify(exp.type || "");
`;
content = content.replace(/export function ExperiencesView\(\{([^}]+)\}\) \{/g, "export function ExperiencesView({$1}) {\n" + helperFunc);

// Replace instances of slugify(exp.type) and slugify(e.type) with getTypeSlug(exp) / getTypeSlug(e)
content = content.replace(/slugify\(e\.type\)/g, "getTypeSlug(e)");
content = content.replace(/slugify\(exp\.type\)/g, "getTypeSlug(exp)");

// Replace the Array.from(new Set(...)) logic
const newTypesLogic = `
          {(() => {
            const typeMap = new Map();
            experiences.forEach(e => {
              if (e.type) {
                typeMap.set(getTypeSlug(e), e.type);
              }
            });
            return Array.from(typeMap.entries()).map(([tSlug, tName]) => {
              const isActive = activeTypeSlug === tSlug;
              return (
                <Link
                  key={tSlug}
                  href={\`/opplevelser/\${tSlug}\`}
                  scroll={false}
                  className={\`px-4 py-2 rounded-full text-sm font-medium transition-all border \${
                    isActive
                      ? "border-[#9C39FF] bg-[#9C39FF]/20 text-white shadow-[0_0_15px_rgba(156,57,255,0.2)]"
                      : "border-zinc-800 bg-transparent text-zinc-400 hover:border-zinc-600 hover:text-white"
                  }\`}
                >
                  {tName}
                </Link>
              );
            });
          })()}
`;

content = content.replace(/\{Array\.from\(new Set\(experiences\.map\(e => e\.type\)\)\)[\s\S]*?<\/Link>\s*\n\s*\}\)/, newTypesLogic.trim());

fs.writeFileSync(filePath, content);
console.log("ExperiencesView.tsx updated.");
