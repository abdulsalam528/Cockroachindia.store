'use client';

import React, { useState, useEffect } from 'react';
import { User, MessageCircle, ShieldCheck, Sparkles, Filter, Search } from 'lucide-react';
import Loader from '../components/Loader';

export default function MembersClient() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadMembers() {
      try {
        const res = await fetch('/api/members');
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members || []);
        }
      } catch (err) {
        console.error('Failed to load members:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, []);

  // Filter members based on search query
  const filteredMembers = members.filter(member =>
    member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.partyMemberId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to generate hilarious slacker level metadata
  const getSlackerLevel = (id) => {
    if (!id) return 'Procrastination Level: Novice';
    const sum = id.split('').reduce((acc, char) => acc + (isNaN(char) ? char.charCodeAt(0) : Number(char)), 0);
    const levels = [
      'Chronically Online Expert',
      'Tea Drinking Filibuster Master',
      'Utility Bill Evader (Level 8)',
      '18-Hour Doomscroller',
      'Procrastination Quotient: 99.8%',
      'Anti-Work Theoretical Physicist',
      'Executive Procrastinator',
      'Coffee Bribed Committee Chair'
    ];
    return levels[sum % levels.length];
  };

  const getSlogan = (id) => {
    if (!id) return 'Let me sleep.';
    const sum = id.split('').reduce((acc, char) => acc + (isNaN(char) ? char.charCodeAt(0) : Number(char)), 0);
    const slogans = [
      '“I crawl so you can rest.”',
      '“Why do today what can be deferred indefinitely?”',
      '“Stronger together, but sitting down.”',
      '“Resilient, unbothered, and chronically asleep.”',
      '“The office chair is my battle shield.”',
      '“Caffeine is the only policy I approve.”',
      '“Squash us, we multiply.”'
    ];
    return slogans[sum % slogans.length];
  };

  return (
    <div className="vintage-grain min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-10">
      
      {/* Directory Branding Banner */}
      <section className="border-4 border-black bg-black text-[#EAE5D9] p-8 text-center flex flex-col gap-3">
        <span className="text-2xl animate-spin self-center">🪳</span>
        <h1 className="font-display text-3xl sm:text-5xl uppercase font-black tracking-wide leading-none text-[#C2410C]">
          VERIFIED MEMBER DIRECTORY
        </h1>
        <p className="text-xs max-w-xl mx-auto leading-relaxed text-gray-300 font-semibold font-mono">
          Registry Sheet CIS-DIR-2026. Displaying all citizens who have successfully registered or procured cotton gear to bypass toxic productivity structures.
        </p>
      </section>

      {/* Filter and search controllers */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-b-2 border-black pb-4">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search comrades by name or Member ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-2 border-black bg-white px-3 py-2 pl-10 text-xs font-bold outline-none focus:border-[#C2410C] font-mono text-black"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
        
        <div className="bg-black text-[#EAE5D9] text-xs font-bold px-3 py-2 border border-black flex items-center gap-1.5 self-stretch sm:self-auto justify-center">
          <Filter className="w-3.5 h-3.5" />
          TOTAL ENLISTED: {filteredMembers.length} COMRADES
        </div>
      </div>

      {loading ? (
        <Loader text="Decrypting member database..." subtext="Accessing directory logs..." fullScreen={false} />
      ) : filteredMembers.length === 0 ? (
        <div className="border-4 border-dashed border-black p-12 text-center text-xs font-bold uppercase text-gray-700 bg-white/40">
          No comrades match the query coordinates.
        </div>
      ) : (
        /* High-density layout grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div key={member._id} className="border-4 border-black bg-[#EAE5D9] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all flex flex-col justify-between gap-4">
              
              {/* Profile Card Top */}
              <div className="flex gap-4 items-start">
                {/* Avatar frame */}
                <div className="w-14 h-14 bg-black border-2 border-black flex items-center justify-center text-3xl flex-shrink-0">
                  {member.isVerifiedMember ? '🪳' : '👤'}
                </div>
                
                <div className="flex-grow min-w-0">
                  <h4 className="font-display text-sm uppercase font-black tracking-normal leading-none truncate text-black">
                    {member.fullName}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">
                    ID: {member.partyMemberId || 'PENDING PROCUREMENT'}
                  </p>
                  
                  {/* Verified Member tag */}
                  {member.isVerifiedMember ? (
                    <span className="inline-flex items-center gap-1 bg-[#4D5B46] text-[#EAE5D9] border border-black text-[9px] font-bold px-1.5 py-0.5 mt-2 uppercase tracking-wide">
                      <ShieldCheck className="w-3 h-3 text-[#EAE5D9]" />
                      VERIFIED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-gray-300 text-gray-700 border border-gray-400 text-[9px] font-bold px-1.5 py-0.5 mt-2 uppercase tracking-wide">
                      UNVERIFIED
                    </span>
                  )}
                </div>
              </div>

              {/* Satirical Quotes and Levels */}
              <div className="border-t border-black/20 pt-3 flex flex-col gap-1.5">
                <div className="text-[10px] font-bold text-gray-700 uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#C2410C] flex-shrink-0" />
                  {getSlackerLevel(member.partyMemberId)}
                </div>
                
                <p className="text-xs italic text-gray-900 font-semibold leading-relaxed border-l-2 border-black/40 pl-2 py-0.5 bg-white/20 mt-1">
                  {getSlogan(member.partyMemberId)}
                </p>
              </div>

              {/* Action WhatsApp coordinate */}
              <div className="border-t border-black/20 pt-3 mt-auto flex justify-between items-center text-[10px] text-gray-600">
                <span>Joined CIS: {new Date(member.createdAt).toLocaleDateString('en-IN')}</span>
                {member.whatsappLink ? (
                  <a
                    href={member.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-green-800 hover:text-black font-black uppercase text-[10px]"
                  >
                    Contact <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  </a>
                ) : (
                  <span className="italic text-gray-400 text-[9px]">No Com Link</span>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
