const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../components/ExperiencesManager.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<div className="grid md:grid-cols-2 gap-6">([\s\S]*?)<div className="mt-6 flex justify-end gap-3">/;

const newFormLayout = `<div className="flex flex-col gap-8">
            {/* GRUNNLEGGENDE INFO */}
            <div>
              <h4 className="text-lg font-medium mb-4 text-white border-b border-zinc-800 pb-2">Grunnleggende info</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Navn</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Undertittel (valgfri)</label>
                  <input
                    type="text"
                    value={editForm.subName || ""}
                    onChange={(e) => setEditForm({...editForm, subName: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                    placeholder="e.g. Mixed Reality Edition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Type</label>
                  <select 
                    value={editForm.typeId || ""}
                    onChange={(e) => {
                      const typeObj = experienceTypes.find(t => t.id === e.target.value);
                      setEditForm({...editForm, typeId: e.target.value, type: typeObj?.name || ""});
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  >
                    <option value="">Velg type...</option>
                    {experienceTypes.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Kort beskrivelse</label>
                  <textarea 
                    value={editForm.shortDescription}
                    onChange={(e) => setEditForm({...editForm, shortDescription: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF] min-h-[60px]"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Detaljert beskrivelse</label>
                  <textarea 
                    value={editForm.detailedDescription || ""}
                    onChange={(e) => setEditForm({...editForm, detailedDescription: e.target.value})}
                    placeholder="En mer detaljert beskrivelse..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF] min-h-[120px]"
                  />
                </div>
              </div>
            </div>

            {/* SPESIFIKASJONER */}
            <div>
              <h4 className="text-lg font-medium mb-4 text-white border-b border-zinc-800 pb-2">Spesifikasjoner</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Aldersgrense</label>
                  <input 
                    type="text" 
                    value={editForm.age}
                    onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Maks spillere</label>
                  <input 
                    type="number" 
                    value={editForm.maxPlayers}
                    onChange={(e) => setEditForm({...editForm, maxPlayers: Number(e.target.value)})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Vanskelighetsgrad / Aktivitet</label>
                  <input 
                    type="text" 
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm({...editForm, difficulty: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Arena Size (valgfri)</label>
                  <input 
                    type="text"
                    value={editForm.arenaSize || ""}
                    onChange={(e) => setEditForm({...editForm, arenaSize: e.target.value})}
                    placeholder="e.g. 140 kvm"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
              </div>
            </div>

            {/* TAGS OG SYNLIGHET */}
            <div>
              <h4 className="text-lg font-medium mb-4 text-white border-b border-zinc-800 pb-2">Filtrering & Synlighet</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">Målgruppe</label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.familyFriendly || false}
                        onChange={(e) => setEditForm({...editForm, familyFriendly: e.target.checked})}
                        className="w-4 h-4 accent-[#9C39FF]"
                      />
                      <span className="ml-2 text-sm text-zinc-300">Familie</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.teambuilding || false}
                        onChange={(e) => setEditForm({...editForm, teambuilding: e.target.checked})}
                        className="w-4 h-4 accent-[#9C39FF]"
                      />
                      <span className="ml-2 text-sm text-zinc-300">Teambuilding</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.party || false}
                        onChange={(e) => setEditForm({...editForm, party: e.target.checked})}
                        className="w-4 h-4 accent-[#9C39FF]"
                      />
                      <span className="ml-2 text-sm text-zinc-300">Vennegjeng / Feiring</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">Stemning</label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.action || false}
                        onChange={(e) => setEditForm({...editForm, action: e.target.checked})}
                        className="w-4 h-4 accent-[#9C39FF]"
                      />
                      <span className="ml-2 text-sm text-zinc-300">Action</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.jumpScare || false}
                        onChange={(e) => setEditForm({...editForm, jumpScare: e.target.checked})}
                        className="w-4 h-4 accent-[#9C39FF]"
                      />
                      <span className="ml-2 text-sm text-zinc-300">Jump Scare</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.coop || false}
                        onChange={(e) => setEditForm({...editForm, coop: e.target.checked})}
                        className="w-4 h-4 accent-[#9C39FF]"
                      />
                      <span className="ml-2 text-sm text-zinc-300">Samarbeid</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.competitive || false}
                        onChange={(e) => setEditForm({...editForm, competitive: e.target.checked})}
                        className="w-4 h-4 accent-[#9C39FF]"
                      />
                      <span className="ml-2 text-sm text-zinc-300">Konkurranse</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">Status</label>
                  <label className="flex items-center cursor-pointer bg-zinc-900 border border-zinc-800 p-3 rounded-xl hover:border-zinc-700 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                      className="w-5 h-5 accent-[#9C39FF]"
                    />
                    <div className="ml-3 flex flex-col">
                      <span className="text-sm font-medium text-white">Aktiv (Synlig)</span>
                      <span className="text-xs text-zinc-500">Vis på forsiden</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* MEDIA */}
            <div>
              <h4 className="text-lg font-medium mb-4 text-white border-b border-zinc-800 pb-2">Media & Ekstra</h4>
              <div className="flex flex-col gap-6">
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2">Hovedbilde</label>
                    <div className="flex items-start gap-4">
                      {editForm.picture ? (
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-zinc-800">
                          <Image src={editForm.picture} alt="Experience" fill className="object-cover" />
                          <button 
                            onClick={() => setEditForm({...editForm, picture: ""})}
                            className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-black/80 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 flex flex-col items-center justify-center text-zinc-500">
                          <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                          <span className="text-[10px]">Ingen bilde</span>
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <label className="flex items-center justify-center gap-2 w-full md:w-auto bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-xl cursor-pointer transition-colors border border-zinc-700 text-sm">
                          {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {uploadingImage ? "Laster opp..." : "Last opp nytt"}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                          />
                        </label>
                        <p className="text-[10px] text-zinc-500 mt-2">Anbefalt: 800x600px. Maks 2MB.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Trailer / Video URL (YouTube/Vimeo)</label>
                    <input 
                      type="url" 
                      value={editForm.videoUrl || ""}
                      onChange={(e) => setEditForm({...editForm, videoUrl: e.target.value})}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Awards & Recognitions</label>
                  <div className="flex flex-wrap gap-3">
                    {Array.isArray(editForm.awards) && editForm.awards.map((awardUrl, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={awardUrl} alt={\`Award \${index + 1}\`} className="max-w-full max-h-full object-contain" />
                        <button 
                          onClick={() => removeAward(index)}
                          className="absolute top-1 right-1 bg-red-500/80 p-1 rounded-full text-white hover:bg-red-500 transition-colors"
                          title="Fjern award"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    <div className="w-20 h-20 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 flex flex-col items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-400 transition-colors relative cursor-pointer">
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-[9px] text-center px-1">Last opp</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={handleAwardUpload}
                        disabled={uploadingImage}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">`;

content = content.replace(regex, newFormLayout);

fs.writeFileSync(filePath, content);
console.log("Admin form tidied up!");
