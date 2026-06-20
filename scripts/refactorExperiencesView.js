const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../components/ExperiencesView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add activeMoodFilter state
content = content.replace(
  `const [activeFilter, setActiveFilter] = useState<string>("Alle");`,
  `const [activeFilter, setActiveFilter] = useState<string>("Alle");\n  const [activeMoodFilter, setActiveMoodFilter] = useState<string>("Alle stemninger");`
);

// 2. Update filteredExperiences logic
const filterLogicRegex = /const filteredExperiences = experiences\.filter\(exp => \{[\s\S]*?return attrMatch && typeMatch;\n  \}\);/;
const newFilterLogic = `const filteredExperiences = experiences.filter(exp => {
    let targetMatch = true;
    if (activeFilter === "Familie") targetMatch = exp.familyFriendly;
    else if (activeFilter === "Teambuilding") targetMatch = exp.teambuilding;
    else if (activeFilter === "Vennegjeng / Feiring") targetMatch = exp.party;
    
    let typeMatch = true;
    if (activeTypeSlug && activeTypeSlug !== "alle") {
      typeMatch = getTypeSlug(exp) === activeTypeSlug;
    }

    let moodMatch = true;
    if (activeMoodFilter === "Action") moodMatch = exp.action;
    else if (activeMoodFilter === "Jump Scare") moodMatch = exp.jumpScare;
    else if (activeMoodFilter === "Samarbeid") moodMatch = exp.coop;
    else if (activeMoodFilter === "Konkurranse") moodMatch = exp.competitive;

    return targetMatch && typeMatch && moodMatch;
  });`;
content = content.replace(filterLogicRegex, newFilterLogic);

// 3. Update handleFilterClick logic (replace it entirely)
const handleFilterRegex = /const handleFilterClick = \(filter: string\) => \{[\s\S]*?\}\s*\};\n/;
const newHandleFilter = `const handleFilterClick = (filterGroup: string, filterValue: string) => {
    let newTarget = activeFilter;
    let newMood = activeMoodFilter;
    
    if (filterGroup === "target") {
      newTarget = filterValue;
      setActiveFilter(filterValue);
    } else if (filterGroup === "mood") {
      newMood = filterValue;
      setActiveMoodFilter(filterValue);
    }
    
    const newFiltered = experiences.filter(exp => {
      let targetMatch = true;
      if (newTarget === "Familie") targetMatch = exp.familyFriendly;
      else if (newTarget === "Teambuilding") targetMatch = exp.teambuilding;
      else if (newTarget === "Vennegjeng / Feiring") targetMatch = exp.party;
      
      let typeMatch = true;
      if (activeTypeSlug && activeTypeSlug !== "alle") {
        typeMatch = getTypeSlug(exp) === activeTypeSlug;
      }
      
      let moodMatch = true;
      if (newMood === "Action") moodMatch = exp.action;
      else if (newMood === "Jump Scare") moodMatch = exp.jumpScare;
      else if (newMood === "Samarbeid") moodMatch = exp.coop;
      else if (newMood === "Konkurranse") moodMatch = exp.competitive;

      return targetMatch && typeMatch && moodMatch;
    });

    if (newFiltered.length > 0) {
      setSelectedId(newFiltered[0].id);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      }
    }
  };\n`;
content = content.replace(handleFilterRegex, newHandleFilter);

// 4. Remove the early return for `!selected`
const emptyStateRegex = /if \(experiences\.length === 0 \|\| !selected\) \{[\s\S]*?return \([\s\S]*?\}\n/g;
content = content.replace(emptyStateRegex, (match) => {
  if (match.includes("!selected")) {
    return `if (experiences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Ingen opplevelser lagt til enda</h2>
        <p className="text-zinc-400">Kom tilbake senere for å se våre opplevelser.</p>
      </div>
    );
  }
`;
  }
  return match;
});

// 5. Replace filter UI
const filterUIRegex = /\{\/\* Existing Attribute Filters \*\/\}([\s\S]*?)(?=\{\/\* HORIZONTAL CAROUSEL NAV \*\/)/;

const newFilterUI = `{/* Filter Groups */}
        <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto px-4 mt-8 mb-4">
          
          {/* Target Group */}
          <div className="flex flex-col items-center">
            <h3 className="text-xs md:text-sm text-zinc-500 font-medium mb-3 uppercase tracking-wider">Hvem passer det for?</h3>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {["Alle", "Teambuilding", "Vennegjeng / Feiring", "Familie"].map(filter => (
                <button
                  key={filter}
                  onClick={() => handleFilterClick("target", filter)}
                  className={\`px-4 py-2 rounded-full text-sm font-medium transition-all \${
                    activeFilter === filter
                      ? "bg-[#9C39FF] text-white shadow-[0_0_15px_rgba(156,57,255,0.4)]"
                      : "bg-transparent border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                  }\`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Type Group */}
          <div className="flex flex-col items-center">
            <h3 className="text-xs md:text-sm text-zinc-500 font-medium mb-3 uppercase tracking-wider">Type opplevelse</h3>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/opplevelser"
                scroll={false}
                className={\`px-4 py-2 rounded-full text-sm font-medium transition-all border \${
                  activeTypeSlug === "alle"
                    ? "border-[#9C39FF] bg-[#9C39FF]/20 text-white shadow-[0_0_15px_rgba(156,57,255,0.2)]"
                    : "border-zinc-800 bg-transparent text-zinc-400 hover:border-zinc-600 hover:text-white"
                }\`}
              >
                Alle Typer
              </Link>
              {Array.from(new Set(experiences.map(e => e.type))).filter(Boolean).map(type => {
                const tSlug = slugify(type as string);
                const isActive = activeTypeSlug === tSlug;
                return (
                  <Link
                    key={type as string}
                    href={\`/opplevelser/\${tSlug}\`}
                    scroll={false}
                    className={\`px-4 py-2 rounded-full text-sm font-medium transition-all border \${
                      isActive
                        ? "border-[#9C39FF] bg-[#9C39FF]/20 text-white shadow-[0_0_15px_rgba(156,57,255,0.2)]"
                        : "border-zinc-800 bg-transparent text-zinc-400 hover:border-zinc-600 hover:text-white"
                    }\`}
                  >
                    {type as string}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mood Group */}
          <div className="flex flex-col items-center">
            <p className="text-zinc-400 text-sm md:text-base text-center italic mb-4 max-w-2xl mx-auto px-4">
              «Alle opplevelser hos oss er laget for samarbeid, kommunikasjon og felles mestring.»
            </p>
            <h3 className="text-xs md:text-sm text-zinc-500 font-medium mb-3 uppercase tracking-wider">Stemning</h3>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {["Alle stemninger", "Action", "Jump Scare", "Samarbeid", "Konkurranse"].map(filter => (
                <button
                  key={filter}
                  onClick={() => handleFilterClick("mood", filter)}
                  className={\`px-4 py-2 rounded-full text-sm font-medium transition-all \${
                    activeMoodFilter === filter
                      ? "bg-[#9C39FF] text-white shadow-[0_0_15px_rgba(156,57,255,0.4)]"
                      : "bg-transparent border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                  }\`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
`;
content = content.replace(filterUIRegex, newFilterUI);

// 6. Conditionally render the selected section / empty state
const carouselRegex = /\{\/\* HORIZONTAL CAROUSEL NAV \*\/\}[\s\S]*?className="absolute -right-4 md:-right-12[\s\S]*?\}\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

// I'll manually replace the content below the motion.div to support the empty state.
content = content.replace(/\{\/\* HORIZONTAL CAROUSEL NAV \*\/\}[\s\S]*$/, (match) => {
  return `
      {filteredExperiences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 w-full">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
            <X className="w-8 h-8 text-zinc-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 text-center">Ingen opplevelser funnet</h2>
          <p className="text-zinc-400 text-center max-w-md">Ingen opplevelser matcher filtrene. Prøv å fjerne ett filter.</p>
        </div>
      ) : (
        <>
          {/* HORIZONTAL CAROUSEL NAV */}
          <div className="sticky top-[81px] md:top-[189px] lg:top-[199px] z-40 w-full bg-black py-4 mb-12 shadow-[0_20px_40px_rgba(0,0,0,0.8)] border-b border-white/5">
            <div className="relative w-full max-w-6xl mx-auto flex items-center">
              <button 
                onClick={scrollLeft} 
                className="absolute -left-4 md:-left-12 z-10 p-2 text-zinc-500 hover:text-[#9C39FF] transition-colors"
              >
                <ChevronLeft className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} />
              </button>

              <div 
                ref={scrollRef}
                className="w-full overflow-x-auto hide-scrollbar"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <div className="flex items-start justify-center gap-4 md:gap-8 px-4 w-max min-w-full snap-x snap-mandatory">
                {filteredExperiences.map((exp) => {
                const isSelected = selected ? exp.id === selected.id : false;
                return (
                  <button
                    key={exp.id}
                    data-id={exp.id}
                    onClick={() => setSelectedId(exp.id)}
                    className={\`flex flex-col items-center justify-center flex-shrink-0 snap-center focus:outline-none group min-w-[120px] px-2 py-3 rounded-2xl border transition-all duration-300 \${
                      isSelected 
                        ? "border-[#9C39FF] bg-[#9C39FF]/10 shadow-[0_0_15px_rgba(156,57,255,0.2)]" 
                        : "border-transparent hover:border-zinc-800 hover:bg-zinc-800/30"
                    }\`}
                  >
                    <div 
                      className={\`mb-2 transition-colors duration-300 \${
                        isSelected 
                          ? "text-[#9C39FF]" 
                          : "text-zinc-500 group-hover:text-zinc-300"
                      }\`}
                    >
                      {getIconForType(exp.type, exp.name)}
                    </div>
                    <span className={\`text-sm md:text-base font-medium mb-1 transition-colors \${isSelected ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}\`}>
                      {exp.name}
                    </span>
                    <span className={\`text-[10px] md:text-[11px] uppercase tracking-wider px-2 py-0.5 rounded transition-colors \${isSelected ? "bg-[#9C39FF] text-white" : "text-zinc-500 bg-zinc-900"}\`}>
                      {exp.type}
                    </span>
                  </button>
                );
                })}
                </div>
              </div>

              <button 
                onClick={scrollRight}
                className="absolute -right-4 md:-right-12 z-10 p-2 text-zinc-500 hover:text-[#9C39FF] transition-colors"
              >
                <ChevronRight className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} />
              </button>
            </div>
          </div>

          {/* MAIN EXPERIENCE DISPLAY */}
          {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-6xl mx-auto flex flex-col items-center cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {/* HERO IMAGE */}
            <div className="relative mb-12 w-full">
              <MediaGallery experience={selected} onPlayVideo={() => setIsVideoOpen(true)} />
            </div>
            <div className="flex flex-col items-center mb-8 gap-4 px-4">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-wide uppercase text-center">
                {selected.name}
              </h2>
              {selected.subName && (
                <h3 className="text-lg md:text-2xl text-zinc-400 font-medium tracking-wide uppercase text-center -mt-2">
                  {selected.subName}
                </h3>
              )}
              <span className="text-xs md:text-sm uppercase tracking-wider px-4 py-1.5 rounded bg-[#9C39FF] text-white font-medium">
                {selected.type}
              </span>
            </div>

            {/* AWARDS / RECOGNITIONS */}
            {selected.awards && Array.isArray(selected.awards) && selected.awards.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-8 max-w-4xl mx-auto px-4">
                {selected.awards.map((awardUrl: string, index: number) => (
                  <div key={index} className="relative h-12 md:h-16 flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity">
                    <img 
                      src={awardUrl} 
                      alt={\`Award \${index + 1}\`} 
                      className="max-h-full max-w-[150px] object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" 
                    />
                  </div>
                ))}
              </div>
            )}

            {/* STATS ROW */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-zinc-300 font-medium mb-10 pb-10 border-b border-white/10 w-full max-w-4xl mx-auto px-4">
              <div className="flex items-center gap-2 text-sm md:text-base">
                <Timer className="w-5 h-5 text-white" />
                <span>{selected.duration || "45 min"}</span>
              </div>

              <div className="flex items-center gap-2 text-sm md:text-base">
                <Users className="w-5 h-5 text-white" />
                <span>{selected.maxPlayers ? \`Fra 2-\${selected.maxPlayers} personer\` : "Fra 2-8 personer"}</span>
              </div>

              {selected.arenaSize && (
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <Maximize className="w-5 h-5 text-white" />
                  <span>{selected.arenaSize}</span>
                </div>
              )}

              {selected.age && (
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <UserCheck className="w-5 h-5 text-white" />
                  <span>Fra {selected.age} år</span>
                </div>
              )}

              {selected.difficulty && (
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <Activity className="w-5 h-5 text-white" />
                  <span>{selected.difficulty}</span>
                </div>
              )}
            </div>

            {/* CONTENT SPLIT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-5xl mx-auto px-4">
              {/* LEFT: DESCRIPTION */}
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-6">Om opplevelsen</h3>
                <div className="prose prose-invert prose-lg max-w-none text-zinc-400">
                  {selected.description ? (
                    selected.description.split('\\n').map((paragraph: string, i: number) => (
                      <p key={i} className="mb-4">{paragraph}</p>
                    ))
                  ) : (
                    <p>{selected.shortDescription}</p>
                  )}
                </div>
              </div>

              {/* RIGHT: DETAILS */}
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Nøkkelpunkter</h3>
                  <div className="flex flex-col gap-4">
                    {selected.familyFriendly && (
                      <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                        <div className="bg-[#9C39FF]/20 p-3 rounded-xl">
                          <Baby className="w-6 h-6 text-[#9C39FF]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">Familievennlig</h4>
                          <p className="text-sm text-zinc-400">Passer perfekt for hele familien</p>
                        </div>
                      </div>
                    )}
                    {selected.teambuilding && (
                      <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                        <div className="bg-[#9C39FF]/20 p-3 rounded-xl">
                          <Layers className="w-6 h-6 text-[#9C39FF]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">Teambuilding</h4>
                          <p className="text-sm text-zinc-400">Krever samarbeid og kommunikasjon</p>
                        </div>
                      </div>
                    )}
                    {selected.party && (
                      <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                        <div className="bg-[#9C39FF]/20 p-3 rounded-xl">
                          <PartyPopper className="w-6 h-6 text-[#9C39FF]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">Vennegjeng / Feiring</h4>
                          <p className="text-sm text-zinc-400">Ypperlig for fest og moro!</p>
                        </div>
                      </div>
                    )}
                    {selected.action && (
                      <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                        <div className="bg-[#9C39FF]/20 p-3 rounded-xl">
                          <Zap className="w-6 h-6 text-[#9C39FF]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">Action</h4>
                          <p className="text-sm text-zinc-400">Høyt tempo og spenning!</p>
                        </div>
                      </div>
                    )}
                    {selected.jumpScare && (
                      <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                        <div className="bg-[#9C39FF]/20 p-3 rounded-xl">
                          <Ghost className="w-6 h-6 text-[#9C39FF]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">Jump Scare</h4>
                          <p className="text-sm text-zinc-400">Advarsel: Kan inneholde skremmende elementer</p>
                        </div>
                      </div>
                    )}
                    {selected.coop && (
                      <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                        <div className="bg-[#9C39FF]/20 p-3 rounded-xl">
                          <Handshake className="w-6 h-6 text-[#9C39FF]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">Samarbeid</h4>
                          <p className="text-sm text-zinc-400">Løs oppgavene sammen som et lag</p>
                        </div>
                      </div>
                    )}
                    {selected.competitive && (
                      <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                        <div className="bg-[#9C39FF]/20 p-3 rounded-xl">
                          <Swords className="w-6 h-6 text-[#9C39FF]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">Konkurranse</h4>
                          <p className="text-sm text-zinc-400">Hvem vinner? Konkurrer mot hverandre</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* PRICING IF AVAILABLE */}
                {selected.pricing && Array.isArray(selected.pricing) && selected.pricing.length > 0 && (
                  <div className="bg-gradient-to-br from-zinc-900 to-black p-6 md:p-8 rounded-3xl border border-zinc-800">
                    <h3 className="text-2xl font-bold text-white mb-6">Priser</h3>
                    <div className="flex flex-col gap-3">
                      {selected.pricing.map((p: any, i: number) => (
                        <div key={i} className="flex justify-between items-center border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0">
                          <span className="text-zinc-400">{p.label}</span>
                          <span className="text-white font-bold">{p.price} kr</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* BOOK BUTTON */}
            <div className="mt-16 mb-8 w-full px-4 flex justify-center">
              <Link href={\`/booking?opplevelse=\${selected.id}\`}>
                <Button size="lg" className="bg-[#9C39FF] hover:bg-[#8A2BE2] text-white px-12 py-8 text-xl rounded-full shadow-[0_0_30px_rgba(156,57,255,0.4)] hover:shadow-[0_0_40px_rgba(156,57,255,0.6)] hover:-translate-y-1 transition-all duration-300">
                  Book {selected.name}
                </Button>
              </Link>
            </div>
          </motion.div>
          )}
        </>
      )}

      {/* VIDEO MODAL */}
      {isVideoOpen && selected && selected.videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
            <button 
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe 
              src={getEmbedUrl(selected.videoUrl) + "?autoplay=1"} 
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
`;
});

fs.writeFileSync(filePath, content);
console.log("ExperiencesView refactored!");
