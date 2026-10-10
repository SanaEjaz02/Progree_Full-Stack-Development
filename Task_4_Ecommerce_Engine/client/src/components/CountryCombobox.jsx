import { useEffect, useId, useRef, useState } from 'react';

const countryCodes = `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`.split(' ');
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
export const countryNames = countryCodes.map((code) => regionNames.of(code)).filter(Boolean).sort((a, b) => a.localeCompare(b));
export const isCountryName = (name) => countryNames.includes(name);

export default function CountryCombobox({ value, onChange, invalid = false }) {
  const generatedId = useId();
  const inputRef = useRef(null);
  const listId = `${generatedId}-countries`;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const filtered = countryNames.filter((country) => country.toLowerCase().includes(value.toLowerCase()));

  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(filtered.length - 1);
  }, [activeIndex, filtered.length]);

  const selectCountry = (country) => {
    onChange({ target: { name: 'country', value: country } });
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.min(current + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.max(current <= 0 ? filtered.length - 1 : current - 1, 0));
    } else if (event.key === 'Enter' && open && activeIndex >= 0) {
      event.preventDefault();
      selectCountry(filtered[activeIndex]);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  return <div className="country-combobox">
    <input
      ref={inputRef}
      name="country"
      role="combobox"
      aria-autocomplete="list"
      aria-expanded={open}
      aria-controls={listId}
      aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
      aria-invalid={invalid}
      aria-required="true"
      autoComplete="country-name"
      value={value}
      onChange={(event) => { onChange(event); setOpen(true); setActiveIndex(-1); }}
      onFocus={() => setOpen(true)}
      onBlur={(event) => { if (!event.currentTarget.parentElement.contains(event.relatedTarget)) setOpen(false); }}
      onKeyDown={handleKeyDown}
      placeholder="Type to search countries"
      required
    />
    {open && <ul className="country-options" id={listId} role="listbox" aria-label="Countries">
      {filtered.length ? filtered.map((country, index) => <li
        id={`${listId}-${index}`}
        role="option"
        aria-selected={country === value}
        className={index === activeIndex ? 'is-active' : ''}
        key={country}
        onMouseDown={(event) => event.preventDefault()}
        onMouseEnter={() => setActiveIndex(index)}
        onClick={() => selectCountry(country)}
      >{country}</li>) : <li className="country-options__empty" role="presentation">No matching country</li>}
    </ul>}
  </div>;
}
