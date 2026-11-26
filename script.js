// ABILITY SCORES AND PROFICIENCY

const abilityNames = [
    ['strength', 'Strength'],
    ['dexterity', 'Dexterity'],
    ['constitution', 'Constitution'],
    ['intelligence', 'Intelligence'],
    ['wisdom', 'Wisdom'],
    ['charisma', 'Charisma'],
];

function signed(n) {
    return n >= 0 ? '+' + n : String(n);
}

document.querySelectorAll('.ability').forEach(select => {
    select.innerHTML = '<option value="">—</option>';
    for (let score = 1; score <= 20; score++) {
        const option = document.createElement('option');
        option.value = score;
        option.textContent = score;
        select.appendChild(option);
    }
});

function getModifier(ability) {
    const value = document.getElementById(ability).value;
    return value === '' ? null : Math.floor((Number(value) - 10) / 2);
}

function getProficiency() {
    return Number(document.getElementById('proficiencyBonus').value) || 0;
}

function updateProficiencyFromLevel() {
    const levelInput = document.getElementById('level');
    const level = Math.max(1, Math.min(20, Number(levelInput.value) || 1));

    if (document.getElementById('autoProficiency').checked) {
        document.getElementById('proficiencyBonus').value = 2 + Math.floor((level - 1) / 4);
    }

    updateCalculations();
}

function updateModifiers() {
    abilityNames.forEach(([id]) => {
        const mod = getModifier(id);
        document.getElementById(id + 'Mod').textContent = mod === null ? '—' : signed(mod);
    });
    updateCalculations();
}

// SAVING THROWS

const savingThrows = [
    ['strength', 'Strength'],
    ['dexterity', 'Dexterity'],
    ['constitution', 'Constitution'],
    ['intelligence', 'Intelligence'],
    ['wisdom', 'Wisdom'],
    ['charisma', 'Charisma'],
];

const saveContainer = document.getElementById('savingThrows');

savingThrows.forEach(([ability, name]) => {
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.innerHTML = `
        <h3>${name}</h3>
        <div class="checkline">
            <input type="checkbox" id="saveProf_${ability}">
            <label for="saveProf_${ability}">Proficient</label>
        </div>
        <div class="row" style="grid-template-columns:1fr 75px">
            <div class="calculated" id="saveCalc_${ability}">—</div>
            <input type="number" id="saveOverride_${ability}" placeholder="Override"
                aria-label="${name} saving throw custom total">
        </div>
        <div class="hint">Automatic total / custom total</div>
    `;
    saveContainer.appendChild(panel);
});

// SKILLS

const skills = [
    ['Acrobatics', 'dexterity'],
    ['Animal Handling', 'wisdom'],
    ['Arcana', 'intelligence'],
    ['Athletics', 'strength'],
    ['Deception', 'charisma'],
    ['History', 'intelligence'],
    ['Insight', 'wisdom'],
    ['Intimidation', 'charisma'],
    ['Investigation', 'intelligence'],
    ['Medicine', 'wisdom'],
    ['Nature', 'intelligence'],
    ['Perception', 'wisdom'],
    ['Performance', 'charisma'],
    ['Persuasion', 'charisma'],
    ['Religion', 'intelligence'],
    ['Sleight of Hand', 'dexterity'],
    ['Stealth', 'dexterity'],
    ['Survival', 'wisdom'],
];

const skillsContainer = document.getElementById('skills');

skills.forEach(([name, ability], index) => {
    const row = document.createElement('div');
    row.className = 'panel';
    row.style.marginBottom = '10px';
    const id = 'skill' + index;

    row.innerHTML = `
        <h3>${name}</h3>
        <div class="hint">Ability: ${ability[0].toUpperCase() + ability.slice(1)}</div>
        <div class="checkline">
            <input type="checkbox" id="${id}Prof">
            <label for="${id}Prof">Proficient</label>
        </div>
        <div class="checkline">
            <input type="checkbox" id="${id}Expert">
            <label for="${id}Expert">Expertise (double proficiency)</label>
        </div>
        <div class="row" style="grid-template-columns:1fr 75px">
            <div class="calculated" id="${id}Calc">—</div>
            <input type="number" id="${id}Override" placeholder="Override"
                aria-label="${name} custom total">
        </div>
        <div class="hint">Automatic total / custom total</div>
    `;

    skillsContainer.appendChild(row);
});

// INITIATIVE, PASSIVE PERCEPTION, AND OTHER CALCULATIONS

function getSkillTotal(index) {
    const [name, ability] = skills[index];
    const id = 'skill' + index;
    const override = document.getElementById(id + 'Override').value;

    if (override !== '') return Number(override);

    const mod = getModifier(ability);
    if (mod === null) return null;

    const proficient = document.getElementById(id + 'Prof').checked;
    const expert = document.getElementById(id + 'Expert').checked;
    const prof = getProficiency();

    return mod + (expert ? 2 * prof : proficient ? prof : 0);
}

function updateCombatStats() {
    // Initiative is Dexterity modifier, unless a custom total is entered.
    const dexMod = getModifier('dexterity');
    const initiativeOverride = document.getElementById('initiativeOverride').value;
    const initiativeResult = document.getElementById('initiativeResult');

    if (initiativeOverride !== '') {
        initiativeResult.textContent = signed(Number(initiativeOverride));
        initiativeResult.title = 'Manual initiative total';
    } else {
        initiativeResult.textContent = dexMod === null ? '—' : signed(dexMod);
        initiativeResult.title = 'Calculated from Dexterity';
    }

    // Passive Perception = 10 + the total Perception skill bonus.
    const perceptionIndex = skills.findIndex(([name]) => name === 'Perception');
    const perceptionTotal = getSkillTotal(perceptionIndex);
    const passiveOverride = document.getElementById('passiveOverride').value;
    const passiveResult = document.getElementById('passiveResult');

    if (passiveOverride !== '') {
        passiveResult.textContent = passiveOverride;
        passiveResult.title = 'Manual passive Perception';
    } else {
        passiveResult.textContent = perceptionTotal === null ? '—' : String(10 + perceptionTotal);
        passiveResult.title = '10 + Perception skill bonus';
    }
}

function updateSpellStats() {
    const ability = document.getElementById('spellAbility').value;
    const mod = ability ? getModifier(ability) : null;
    const dcOverride = document.getElementById('spellSaveDC').value;
    const attackOverride = document.getElementById('spellAttackBonus').value;

    document.getElementById('spellDCResult').textContent =
        dcOverride !== '' ? dcOverride : mod === null ? '—' : String(8 + getProficiency() + mod);

    document.getElementById('spellAttackResult').textContent =
        attackOverride !== '' ? signed(Number(attackOverride)) : mod === null ? '—' : signed(getProficiency() + mod);
}

function updateCalculations() {
    const prof = getProficiency();

    savingThrows.forEach(([ability]) => {
        const mod = getModifier(ability);
        const proficient = document.getElementById('saveProf_' + ability).checked;
        const total = mod === null ? null : mod + (proficient ? prof : 0);
        const override = document.getElementById('saveOverride_' + ability).value;

        document.getElementById('saveCalc_' + ability).textContent =
            override !== '' ? signed(Number(override)) : total === null ? '—' : signed(total);
    });

    skills.forEach(([name, ability], index) => {
        const id = 'skill' + index;
        const total = getSkillTotal(index);
        const override = document.getElementById(id + 'Override').value;

        document.getElementById(id + 'Calc').textContent =
            override !== '' ? signed(Number(override)) : total === null ? '—' : signed(total);
    });

    updateCombatStats();
    updateSpellStats();
}

document.querySelectorAll('.ability').forEach(el => el.addEventListener('change', updateModifiers));

document.getElementById('level').addEventListener('input', updateProficiencyFromLevel);
document.getElementById('autoProficiency').addEventListener('change', updateProficiencyFromLevel);
document.getElementById('proficiencyBonus').addEventListener('input', updateCalculations);
document.getElementById('spellAbility').addEventListener('change', updateCalculations);

document.addEventListener('input', event => {
    const id = event.target.id || '';
    if (
        id.startsWith('saveOverride_') ||
        id.startsWith('skill') ||
        id === 'initiativeOverride' ||
        id === 'passiveOverride' ||
        id === 'spellSaveDC' ||
        id === 'spellAttackBonus'
    ) {
        updateCalculations();
    }
});

document.addEventListener('change', event => {
    if (event.target.matches('input[type="checkbox"]')) {
        updateCalculations();
    }
});

// ATTACKS

function addAttack(values = []) {
    const attack = document.createElement('div');
    attack.className = 'attack';

    attack.innerHTML = `
        <div class="attackgrid">
            <div><label>Attack / Weapon</label><input data-field="name" placeholder="Longsword"></div>
            <div><label>Attack Bonus</label><input data-field="bonus" placeholder="+5"></div>
            <div><label>Damage</label><input data-field="damage" placeholder="1d8+3"></div>
            <div><label>Range / Notes</label><input data-field="notes" placeholder="Slashing, 5 ft."></div>
        </div>
        <button type="button" class="danger smallbtn no-print"
            onclick="this.closest('.attack').remove()">Remove Attack</button>
    `;

    attack.querySelectorAll('[data-field]').forEach((input, i) => {
        input.value = values[i] || '';
    });

    document.getElementById('attacks').appendChild(attack);
}

// CLICKABLE SPELL SLOT TRACKER

const slotsContainer = document.getElementById('spellSlots');

function createSlot(level) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.slotLevel = level;

    slot.innerHTML = `
        <div class="slot-title">Level ${level} Spell Slots</div>
        <div class="slotpair">
            <div>
                <label for="slot${level}Max">Total Slots</label>
                <input id="slot${level}Max" type="number" min="0" max="99" value="0">
            </div>
            <div>
                <label for="slot${level}Current">Remaining</label>
                <input id="slot${level}Current" type="number" min="0" max="99" value="0">
            </div>
        </div>
        <div class="slot-counter">
            <button type="button" aria-label="Use one level ${level} spell slot"
                onclick="changeSlots(${level},-1)">−</button>
            <div class="slot-remaining" id="slot${level}Display">
                0<small>remaining</small>
            </div>
            <button type="button" aria-label="Restore one level ${level} spell slot"
                onclick="changeSlots(${level},1)">+</button>
        </div>
        <div class="slot-status" id="slot${level}Status">0 of 0 available</div>
    `;

    slotsContainer.appendChild(slot);

    document.getElementById('slot' + level + 'Max').addEventListener('input', () => {
        const maxInput = document.getElementById('slot' + level + 'Max');
        const currentInput = document.getElementById('slot' + level + 'Current');

        let max = Math.max(0, Math.min(99, Number(maxInput.value) || 0));
        maxInput.value = max;

        let current = Math.max(0, Math.min(max, Number(currentInput.value) || 0));
        currentInput.value = current;

        updateSlotDisplay(level);
    });

    document.getElementById('slot' + level + 'Current').addEventListener('input', () => {
        const max = Math.max(0, Number(document.getElementById('slot' + level + 'Max').value) || 0);

        const currentInput = document.getElementById('slot' + level + 'Current');
        currentInput.value = Math.max(0, Math.min(max, Number(currentInput.value) || 0));

        updateSlotDisplay(level);
    });
}

function updateSlotDisplay(level) {
    const max = Math.max(0, Number(document.getElementById('slot' + level + 'Max').value) || 0);

    const currentInput = document.getElementById('slot' + level + 'Current');
    let current = Math.max(0, Math.min(max, Number(currentInput.value) || 0));
    currentInput.value = current;

    document.getElementById('slot' + level + 'Display').innerHTML = current + '<small>remaining</small>';

    document.getElementById('slot' + level + 'Status').textContent = current + ' of ' + max + ' available';
}

function changeSlots(level, amount) {
    const max = Math.max(0, Number(document.getElementById('slot' + level + 'Max').value) || 0);

    const currentInput = document.getElementById('slot' + level + 'Current');
    const current = Math.max(0, Number(currentInput.value) || 0);

    currentInput.value = Math.max(0, Math.min(max, current + amount));
    updateSlotDisplay(level);
}
function restoreSpellSlots() {
    if (!confirm('Restore all spell-slot counters to their maximum values?')) return;

    for (let level = 1; level <= 9; level++) {
        const max = document.getElementById('slot' + level + 'Max').value;
        document.getElementById('slot' + level + 'Current').value = max;
        updateSlotDisplay(level);
    }
}

// Cantrips are tracked separately; they don't use spell slots.
const cantrips = document.createElement('div');
cantrips.className = 'slot';
cantrips.innerHTML = `
    <div class="slot-title">Cantrips Known</div>
    <label for="cantripsKnown">Number of Cantrips</label>
    <input id="cantripsKnown" type="number" min="0" placeholder="0">
    <div class="hint">Cantrips normally require no spell slots.</div>
`;
slotsContainer.appendChild(cantrips);

for (let level = 1; level <= 9; level++) createSlot(level);

// SPELLBOOK

function addSpell(values = {}) {
    const spell = document.createElement('div');
    spell.className = 'spell';

    spell.innerHTML = `
        <div class="spellhead">
            <h3>Spell Entry</h3>
            <button type="button" class="danger smallbtn no-print"
                onclick="this.closest('.spell').remove()">Remove Spell</button>
        </div>
        <div class="spellgrid">
            <div><label>Spell Name</label><input data-field="name" placeholder="Magic Missile"></div>
            <div><label>Spell Level</label>
                <select data-field="level">
                    <option value="Cantrip">Cantrip</option>
                    <option value="1">1st</option><option value="2">2nd</option>
                    <option value="3">3rd</option><option value="4">4th</option>
                    <option value="5">5th</option><option value="6">6th</option>
                    <option value="7">7th</option><option value="8">8th</option>
                    <option value="9">9th</option>
                </select>
            </div>
            <div><label>School of Magic</label><input data-field="school" placeholder="Evocation"></div>
            <div><label>Casting Time</label><input data-field="casting" placeholder="1 action"></div>
            <div><label>Range</label><input data-field="range" placeholder="120 feet"></div>
            <div><label>Components</label><input data-field="components" placeholder="V, S, M"></div>
            <div><label>Duration</label><input data-field="duration" placeholder="Instantaneous"></div>
            <div><label>Damage / Effect</label><input data-field="effect" placeholder="3 darts, 1d4+1 each"></div>
        </div>
        <div class="spellflags">
            <label><input data-field="prepared" type="checkbox"> Prepared / Known</label>
            <label><input data-field="concentration" type="checkbox"> Concentration</label>
            <label><input data-field="ritual" type="checkbox"> Ritual</label>
            <label><input data-field="always" type="checkbox"> Always Prepared</label>
        </div>
        <div class="spellnotes">
            <label>Description &amp; Higher-Level Effects</label>
            <textarea data-field="description" placeholder="Effects, saving throw, upcasting..."></textarea>
        </div>
        <div class="spellnotes">
            <label>Personal Notes</label>
            <textarea data-field="notes" placeholder="Source, reminders, campaign changes..."></textarea>
        </div>
    `;

    spell.querySelectorAll('[data-field]').forEach(input => {
        const key = input.dataset.field;

        if (input.type === 'checkbox') {
            input.checked = Boolean(values[key]);
        } else if (values[key] !== undefined) {
            input.value = values[key];
        }
    });

    document.getElementById('spellbook').appendChild(spell);
}

// SAVE, LOAD, IMPORT, EXPORT

function collectCharacter() {
    const data = {fields: {}, attacks: [], spells: []};

    document
        .querySelectorAll('#characterForm input[id], #characterForm select[id], #characterForm textarea[id]')
        .forEach(element => {
            data.fields[element.id] = element.type === 'checkbox' ? element.checked : element.value;
        });

    data.attacks = Array.from(document.querySelectorAll('#attacks .attack')).map(row =>
        Array.from(row.querySelectorAll('[data-field]')).map(input => input.value),
    );

    data.spells = Array.from(document.querySelectorAll('#spellbook .spell')).map(spell => {
        const values = {};
        spell.querySelectorAll('[data-field]').forEach(input => {
            values[input.dataset.field] = input.type === 'checkbox' ? input.checked : input.value;
        });
        return values;
    });

    return data;
}

function applyCharacter(data) {
    if (!data || !data.fields) throw new Error('Invalid character backup.');

    isApplyingCharacter = true;

    Object.entries(data.fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (!element) return;

        if (element.type === 'checkbox') element.checked = Boolean(value);
        else element.value = value;
    });

    document.getElementById('attacks').innerHTML = '';
    (data.attacks || []).forEach(values => addAttack(values));
    if (!data.attacks || !data.attacks.length) addAttack();

    document.getElementById('spellbook').innerHTML = '';
    (data.spells || []).forEach(values => addSpell(values));

    updateModifiers();

    for (let level = 1; level <= 9; level++) updateSlotDisplay(level);

    updateProficiencyFromLevel();
    isApplyingCharacter = false;
}

// Browser storage is a convenient working copy. Computer files are
// separate JSON backups that you control and can move between devices.
let autosaveTimer = null;
let isApplyingCharacter = false;

function setSaveStatus(message) {
    const status = document.getElementById('saveStatus');
    if (status) status.textContent = message;
}

function saveCharacter() {
    try {
        localStorage.setItem('dndCharacterScroll', JSON.stringify(collectCharacter()));
        setSaveStatus('Saved in this browser.');
        alert('Character saved in this browser.');
    } catch (error) {
        setSaveStatus('Browser save failed. Try saving a file to your computer.');
        alert('Saving failed. Your browser may have storage disabled or full.');
    }
}

function scheduleAutosave() {
    if (isApplyingCharacter) return;

    clearTimeout(autosaveTimer);
    setSaveStatus('Changes detected — saving…');

    autosaveTimer = setTimeout(() => {
        try {
            localStorage.setItem('dndCharacterScroll', JSON.stringify(collectCharacter()));
            setSaveStatus('Automatically saved in this browser.');
        } catch (error) {
            setSaveStatus('Autosave failed. Please save a file to your computer.');
        }
    }, 500);
}

function loadCharacter() {
    try {
        const saved = localStorage.getItem('dndCharacterScroll');

        if (!saved) {
            alert('No saved character was found in this browser.');
            return;
        }

        if (!confirm('Load the browser-saved character? This will replace the information currently on the scroll.')) {
            return;
        }

        applyCharacter(JSON.parse(saved));
        setSaveStatus('Loaded the character saved in this browser.');
        scheduleAutosave();
        alert('Character loaded from this browser.');
    } catch (error) {
        alert('The saved character could not be loaded. The saved data may be damaged.');
    }
}

function getCharacterFilename() {
    const first = document.getElementById('firstName').value.trim();
    const last = document.getElementById('lastName').value.trim();
    const characterName = [first, last].filter(Boolean).join(' ') || 'dnd-character';
    const safeName = characterName
        .replace(/[\\\\/:*?"<>|]/g, '')
        .replace(/\\s+/g, '-')
        .toLowerCase();

    return safeName + '.json';
}
function exportCharacter() {
    try {
        const data = {
            format: 'dnd-character-scroll',
            version: 1,
            exportedAt: new Date().toISOString(),
            character: collectCharacter(),
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = getCharacterFilename();
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        setSaveStatus('Character file downloaded to your computer.');
    } catch (error) {
        alert('The character file could not be created.');
    }
}

function importCharacter(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!confirm('Load this character file? It will replace the information currently on the scroll.')) {
        event.target.value = '';
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const parsed = JSON.parse(reader.result);
            // Accept both the older backup format and the newer wrapped format.
            const characterData = parsed.character || parsed;
            if (!characterData || typeof characterData !== 'object' || !characterData.fields) {
                throw new Error('This file is not a valid character backup.');
            }

            applyCharacter(characterData);
            scheduleAutosave();
            setSaveStatus('Character loaded from ' + file.name + '.');
            alert('Character loaded from your computer.');
        } catch (error) {
            alert('That file could not be loaded. Please choose a valid character JSON file.');
        }

        event.target.value = '';
    };

    reader.onerror = () => {
        alert('The selected file could not be read.');
        event.target.value = '';
    };

    reader.readAsText(file);
}

function clearCharacter() {
    if (!confirm('Start a new character? Save or export your current character first if you need it.')) {
        return;
    }

    document.getElementById('characterForm').reset();
    document.getElementById('attacks').innerHTML = '';
    document.getElementById('spellbook').innerHTML = '';

    addAttack();

    for (let level = 1; level <= 9; level++) {
        document.getElementById('slot' + level + 'Max').value = 0;
        document.getElementById('slot' + level + 'Current').value = 0;
        updateSlotDisplay(level);
    }

    updateModifiers();
    updateProficiencyFromLevel();
}

// INITIALIZE

addAttack();
updateModifiers();
updateProficiencyFromLevel();

// Restore the latest browser autosave automatically when the page opens.
try {
    const autosaved = localStorage.getItem('dndCharacterScroll');
    if (autosaved) {
        applyCharacter(JSON.parse(autosaved));
        setSaveStatus('Your latest browser-saved character was restored.');
    }
} catch (error) {
    setSaveStatus('A previous browser save could not be restored. You can load a backup file.');
}

// Save changes to fields, dynamic attacks/spells, and spell-slot controls.
const characterForm = document.getElementById('characterForm');
characterForm.addEventListener('input', scheduleAutosave);
characterForm.addEventListener('change', scheduleAutosave);
characterForm.addEventListener('click', event => {
    if (event.target.closest('button')) scheduleAutosave();
});
