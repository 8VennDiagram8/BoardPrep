import type {
  Catalog,
  Difficulty,
  Flashcard,
  Program,
  ProgramId,
  Question,
  Subject,
  Topic,
} from '../lib/types'

export const programs: Program[] = [
  {
    id: 'ecele',
    code: 'ECELE',
    name: 'Electronics and Communications Engineering Licensure Examination',
    shortName: 'Electronics & Communications Engineering',
    description:
      'The PRC board exam for Electronics and Communications Engineers. Master circuits, devices, electromagnetics and communications.',
    accent: 'indigo',
    glyph: '📡',
  },
  {
    id: 'ectle',
    code: 'ECTLE',
    name: 'Electronics Engineering Technician Licensure Examination',
    shortName: 'Electronics Engineering Technician',
    description:
      'The PRC board exam for Electronics Engineering Technicians. Build hands-on mastery of devices, digital systems, troubleshooting and safety.',
    accent: 'cyan',
    glyph: '🔧',
  },
]

export const subjects: Subject[] = [
  // ---------------------------------------------------------------- ECELE
  {
    id: 'ecele-math',
    programId: 'ecele',
    name: 'Mathematics',
    code: 'MATH',
    description: 'Algebra, trigonometry, calculus and statistics.',
    glyph: '∑',
  },
  {
    id: 'ecele-electronics',
    programId: 'ecele',
    name: 'Electronics',
    code: 'ELEC',
    description: 'Devices, amplifier circuits and digital logic.',
    glyph: '⚡',
  },
  {
    id: 'ecele-emag',
    programId: 'ecele',
    name: 'Electromagnetics',
    code: 'EMAG',
    description: 'Fields, waves, transmission lines and antennas.',
    glyph: '〰️',
  },
  {
    id: 'ecele-comm',
    programId: 'ecele',
    name: 'Communications',
    code: 'COMM',
    description: 'Analog and digital communication systems and networks.',
    glyph: '📶',
  },
  {
    id: 'ecele-circuits',
    programId: 'ecele',
    name: 'Circuit Analysis',
    code: 'CIRCUIT',
    description: 'DC and AC network analysis.',
    glyph: '🔌',
  },
  {
    id: 'ecele-econ',
    programId: 'ecele',
    name: 'Engineering Economics & Management',
    code: 'ECON',
    description: 'Interest, cash flow, law and professional ethics.',
    glyph: '📊',
  },
  // ---------------------------------------------------------------- ECTLE
  {
    id: 'ectle-basics',
    programId: 'ectle',
    name: 'Basic Electronics',
    code: 'BASICS',
    description: 'Components, symbols, diodes and transistors.',
    glyph: '🧰',
  },
  {
    id: 'ectle-digital',
    programId: 'ectle',
    name: 'Digital Electronics',
    code: 'DIGITAL',
    description: 'Logic gates, Boolean algebra and number systems.',
    glyph: '🔢',
  },
  {
    id: 'ectle-electrical',
    programId: 'ectle',
    name: 'Electrical Circuits & Measurements',
    code: 'ELEC',
    description: 'DC/AC circuits, meters and electrical power.',
    glyph: '🔋',
  },
  {
    id: 'ectle-comm',
    programId: 'ectle',
    name: 'Communications Systems',
    code: 'COMM',
    description: 'Radio, modulation and basic data networks.',
    glyph: '📻',
  },
  {
    id: 'ectle-industrial',
    programId: 'ectle',
    name: 'Industrial Electronics',
    code: 'INDUSTRIAL',
    description: 'Motors, relays, PLCs, safety and troubleshooting.',
    glyph: '🏭',
  },
  {
    id: 'ectle-practical',
    programId: 'ectle',
    name: 'Practical Applications',
    code: 'PRACTICAL',
    description: 'Soldering, assembly and test instruments.',
    glyph: '🛠️',
  },
]

type TopicSeed = [id: string, subjectId: string, programId: ProgramId, name: string, description: string]

const topicSeeds: TopicSeed[] = [
  // ECELE
  ['ecele-math-algebra', 'ecele-math', 'ecele', 'Algebra & Trigonometry', 'Logs, complex numbers and identities'],
  ['ecele-math-calculus', 'ecele-math', 'ecele', 'Calculus & Statistics', 'Derivatives, integrals and data analysis'],
  ['ecele-el-devices', 'ecele-electronics', 'ecele', 'Devices & Circuits', 'Diodes, BJTs and amplifier basics'],
  ['ecele-el-digital', 'ecele-electronics', 'ecele', 'Digital Logic', 'Gates, Boolean algebra and numbering'],
  ['ecele-em-fields', 'ecele-emag', 'ecele', 'Fields & Waves', 'Electromagnetic fundamentals and propagation'],
  ['ecele-em-transmission', 'ecele-emag', 'ecele', 'Transmission Lines & Antennas', 'Line parameters, matching and antennas'],
  ['ecele-comm-analog', 'ecele-comm', 'ecele', 'Analog Communications', 'AM, FM and sampling'],
  ['ecele-comm-digital', 'ecele-comm', 'ecele', 'Digital Communications & Networks', 'Coding, error rates and IP networking'],
  ['ecele-ckt-dc', 'ecele-circuits', 'ecele', 'DC Circuits', 'Ohm’s law, resistors and network theorems'],
  ['ecele-ckt-ac', 'ecele-circuits', 'ecele', 'AC Circuits', 'Phasors, RMS, resonance and power'],
  ['ecele-econ-interest', 'ecele-econ', 'ecele', 'Interest & Cash Flow', 'Simple interest, annuities and present worth'],
  ['ecele-econ-ethics', 'ecele-econ', 'ecele', 'Law & Professional Ethics', 'Code of ethics and engineering practice'],
  // ECTLE
  ['ectle-basics-components', 'ectle-basics', 'ectle', 'Components & Symbols', 'Resistors, capacitors and inductors'],
  ['ectle-basics-semi', 'ectle-basics', 'ectle', 'Diodes & Transistors', 'PN junction, Zener and BJT operation'],
  ['ectle-dig-logic', 'ectle-digital', 'ectle', 'Logic Gates & Boolean Algebra', 'AND, OR, NOT and De Morgan’s theorem'],
  ['ectle-dig-systems', 'ectle-digital', 'ectle', 'Number Systems & Memory', 'Binary, hex and basic memory devices'],
  ['ectle-elec-dc', 'ectle-electrical', 'ectle', 'DC Circuits & Measurements', 'Series/parallel circuits and meters'],
  ['ectle-elec-ac', 'ectle-electrical', 'ectle', 'AC Circuits & Power', 'Mains power, RMS and power factor'],
  ['ectle-comm-radio', 'ectle-comm', 'ectle', 'Radio & Modulation', 'Carrier, AM/FM and antenna basics'],
  ['ectle-comm-data', 'ectle-comm', 'ectle', 'Data & Networks', 'Cabling, connectors and OSI layers'],
  ['ectle-ind-control', 'ectle-industrial', 'ectle', 'Control Systems & Motors', 'Relays, contactors, motors and PLCs'],
  ['ectle-ind-safety', 'ectle-industrial', 'ectle', 'Safety & Troubleshooting', 'Grounding, fuses and fault finding'],
  ['ectle-prac-soldering', 'ectle-practical', 'ectle', 'Soldering & Assembly', 'Solder joints, tools and component orientation'],
  ['ectle-prac-instruments', 'ectle-practical', 'ectle', 'Test Instruments', 'Multimeters, scopes and signal generators'],
]

export const topics: Topic[] = topicSeeds.map(([id, subjectId, programId, name, description]) => ({
  id,
  subjectId,
  programId,
  name,
  description,
}))

type QuestionSeed = [
  prompt: string,
  options: string[],
  answerIndex: number,
  explanation: string,
  difficulty: Difficulty,
]

function questionGroup(
  programId: ProgramId,
  subjectId: string,
  topicId: string,
  items: QuestionSeed[],
): Question[] {
  return items.map(([prompt, options, answerIndex, explanation, difficulty], index) => ({
    id: `${topicId}-q${index + 1}`,
    programId,
    subjectId,
    topicId,
    prompt,
    options,
    answerIndex,
    explanation,
    difficulty,
  }))
}

export const questions: Question[] = [
  // ---------------------------------------------------------------- ECELE
  ...questionGroup('ecele', 'ecele-math', 'ecele-math-algebra', [
    ['If log₂(x) = 5, what is the value of x?', ['10', '16', '32', '64'], 2, 'Rewrite in exponential form: x = 2⁵ = 32.', 'easy'],
    ['Simplify (3 + 4i)(3 − 4i).', ['7', '25', '−7', '9 − 16i'], 1, 'This is a difference of squares: 3² + 4² = 25 (the imaginary parts cancel).', 'medium'],
    ['What is the exact value of sin 30°?', ['1/2', '√2/2', '√3/2', '1'], 0, 'From the standard 30-60-90 triangle, sin 30° = opposite/hypotenuse = 1/2.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-math', 'ecele-math-calculus', [
    ['What is the derivative of f(x) = x³ + 2x?', ['3x² + 2', '3x² + 2x', 'x² + 2', '3x + 2'], 0, 'Apply the power rule: d/dx(x³) = 3x² and d/dx(2x) = 2.', 'easy'],
    ['Evaluate ∫ 2x dx.', ['x² + C', '2 + C', 'x + C', '2x² + C'], 0, 'The antiderivative of 2x is x²; always add the constant of integration C.', 'easy'],
    ['Find the mean of the data set {2, 4, 6, 8}.', ['4', '5', '6', '7'], 1, 'Mean = (2 + 4 + 6 + 8) / 4 = 20 / 4 = 5.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-electronics', 'ecele-el-devices', [
    ['What is the approximate forward voltage drop of a silicon diode?', ['0.2 V', '0.3 V', '0.7 V', '1.4 V'], 2, 'A forward-biased silicon diode typically drops about 0.7 V; germanium drops about 0.3 V.', 'easy'],
    ['In a common-emitter BJT amplifier, what is the phase relationship between input and output?', ['0°', '90°', '180°', '270°'], 2, 'A common-emitter stage inverts the signal, producing a 180° phase shift.', 'medium'],
    ['The current gain β of a BJT is defined as:', ['Ic / Ib', 'Ib / Ic', 'Ie / Ib', 'Ic / Ie'], 0, 'β (hFE) is the ratio of collector current to base current.', 'medium'],
  ]),
  ...questionGroup('ecele', 'ecele-electronics', 'ecele-el-digital', [
    ['A NAND gate output is LOW only when:', ['all inputs are LOW', 'any input is HIGH', 'all inputs are HIGH', 'inputs are equal'], 2, 'NAND is the inverse of AND: it is LOW only when every input is HIGH.', 'easy'],
    ['Using Boolean algebra, A + Ā equals:', ['0', '1', 'A', 'Ā'], 1, 'The complement law states that a variable ORed with its complement always equals 1.', 'easy'],
    ['How many distinct values can a 4-bit binary word represent?', ['8', '15', '16', '32'], 2, 'An n-bit word represents 2ⁿ values, so 2⁴ = 16 (0 through 15).', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-emag', 'ecele-em-fields', [
    ['What is the approximate speed of an electromagnetic wave in free space?', ['3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s', '1.5 × 10⁸ m/s'], 1, 'The speed of light in vacuum is approximately 3 × 10⁸ m/s.', 'easy'],
    ['A wave has a frequency of 100 MHz. What is its wavelength in free space?', ['0.3 m', '3 m', '30 m', '300 m'], 1, 'λ = c / f = (3 × 10⁸) / (1 × 10⁸) = 3 m.', 'medium'],
    ['The SI unit of magnetic flux density (B) is the:', ['Weber', 'Tesla', 'Henry', 'Gauss'], 1, 'Magnetic flux density is measured in tesla (T); weber is the unit of flux.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-emag', 'ecele-em-transmission', [
    ['The physical length of a half-wave dipole antenna is approximately:', ['λ/4', 'λ/2', 'λ', '2λ'], 1, 'A half-wave dipole is about half a wavelength long (≈ 0.47λ with end effects).', 'medium'],
    ['For a lossless transmission line, the characteristic impedance is:', ['Zo = √(L/C)', 'Zo = √(C/L)', 'Zo = L/C', 'Zo = LC'], 0, 'The lossless line impedance is Zo = √(L/C), purely real.', 'medium'],
    ['A VSWR of exactly 1 indicates:', ['a complete mismatch', 'a perfect match', 'a short circuit', 'an open circuit'], 1, 'VSWR = 1 means no reflected wave — the load is perfectly matched to the line.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-comm', 'ecele-comm-analog', [
    ['For an AM wave, the modulation index m is given by:', ['(Emax − Emin) / (Emax + Emin)', '(Emax + Emin) / (Emax − Emin)', 'Emax / Emin', 'Emin / Emax'], 0, 'The modulation index is computed from the envelope maxima and minima.', 'medium'],
    ['Which modulation scheme keeps the carrier amplitude constant?', ['AM', 'FM', 'ASK', 'PAM'], 1, 'Frequency modulation varies frequency while the amplitude remains constant.', 'easy'],
    ['According to the Nyquist sampling theorem, the sampling frequency must be:', ['equal to fm', 'at least 2fm', 'at most 2fm', 'half of fm'], 1, 'To avoid aliasing, fs must be at least twice the highest message frequency.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-comm', 'ecele-comm-digital', [
    ['The theoretical minimum bandwidth for binary baseband signalling at bit rate Rb is:', ['Rb', 'Rb/2', '2Rb', '4Rb'], 1, 'Nyquist’s criterion gives a minimum bandwidth of Rb/2 Hz for ideal binary signalling.', 'hard'],
    ['An IPv4 address consists of:', ['16 bits', '32 bits', '64 bits', '128 bits'], 1, 'IPv4 uses 32-bit addresses, usually written in dotted-decimal notation.', 'easy'],
    ['A bit error rate of 10⁻⁶ means:', ['1 error per 10 bits', '1 error per 1,000 bits', '1 error per 1,000,000 bits', '1 error per 100 bits'], 2, 'BER is the ratio of erroneous bits to total transmitted bits, so 10⁻⁶ = 1 in a million.', 'medium'],
  ]),
  ...questionGroup('ecele', 'ecele-circuits', 'ecele-ckt-dc', [
    ['A 12 V source is connected to a 4 Ω resistor. What is the current?', ['2 A', '3 A', '4 A', '48 A'], 1, 'By Ohm’s law, I = V / R = 12 / 4 = 3 A.', 'easy'],
    ['Two resistors of 4 Ω and 6 Ω connected in series have an equivalent resistance of:', ['2.4 Ω', '10 Ω', '5 Ω', '24 Ω'], 1, 'Series resistances add directly: 4 + 6 = 10 Ω.', 'easy'],
    ['The power dissipated by a 2 Ω resistor carrying 3 A is:', ['6 W', '12 W', '18 W', '36 W'], 2, 'P = I²R = 3² × 2 = 18 W.', 'medium'],
  ]),
  ...questionGroup('ecele', 'ecele-circuits', 'ecele-ckt-ac', [
    ['For a sinusoid with peak voltage Vp, the RMS voltage is:', ['Vp / 2', 'Vp / √2', 'Vp × √2', 'Vp'], 1, 'Vrms = Vp / √2 ≈ 0.707 Vp for a sine wave.', 'easy'],
    ['In a purely capacitive AC circuit, the current:', ['leads voltage by 90°', 'lags voltage by 90°', 'is in phase with voltage', 'leads by 180°'], 0, 'For a capacitor, current leads voltage by 90° (ICE).', 'medium'],
    ['Series resonance in an RLC circuit occurs when:', ['XL > XC', 'XL < XC', 'XL = XC', 'R = 0'], 2, 'At resonance the inductive and capacitive reactances cancel: XL = XC.', 'medium'],
  ]),
  ...questionGroup('ecele', 'ecele-econ', 'ecele-econ-interest', [
    ['The simple interest on ₱1,000 at 10% per year for 2 years is:', ['₱100', '₱200', '₱220', '₱1,200'], 1, 'I = P × r × t = 1000 × 0.10 × 2 = ₱200.', 'easy'],
    ['An annuity is best described as:', ['a single lump-sum payment', 'a series of equal payments at equal intervals', 'a one-time investment', 'an irregular cash inflow'], 1, 'An annuity is a sequence of equal payments made at regular time intervals.', 'easy'],
    ['At 8% simple interest per year, money will double in approximately:', ['8 years', '10 years', '12.5 years', '16 years'], 2, 'Doubling requires I = P, so t = 1 / 0.08 = 12.5 years.', 'medium'],
  ]),
  ...questionGroup('ecele', 'ecele-econ', 'ecele-econ-ethics', [
    ['The foremost obligation of an engineer under a code of ethics is to:', ['maximize profit', 'hold paramount the safety, health and welfare of the public', 'follow client instructions blindly', 'minimize project time'], 1, 'Engineering codes of ethics place public safety, health and welfare above all else.', 'easy'],
    ['Bid rigging among competing contractors is:', ['standard practice', 'unethical and illegal', 'allowed if the client agrees', 'a form of value engineering'], 1, 'Bid rigging is collusion that suppresses competition and is both unethical and illegal.', 'medium'],
    ['Continuing professional development is generally required for:', ['licensure renewal', 'getting a first job', 'graduation', 'internship'], 0, 'PRC requires CPD credits as a condition for renewal of professional licenses.', 'easy'],
  ]),

  // ---------------------------------------------------------------- ECTLE
  ...questionGroup('ectle', 'ectle-basics', 'ectle-basics-components', [
    ['A resistor with colour bands brown–black–red has a resistance of:', ['100 Ω', '1 kΩ', '10 kΩ', '100 kΩ'], 1, 'Brown = 1, black = 0, red = ×100, giving 10 × 100 = 1,000 Ω = 1 kΩ.', 'medium'],
    ['Which component stores energy in an electric field?', ['Resistor', 'Capacitor', 'Inductor', 'Diode'], 1, 'A capacitor stores energy in the electric field between its plates.', 'easy'],
    ['Which component opposes changes in current flow?', ['Capacitor', 'Inductor', 'Resistor', 'LED'], 1, 'An inductor resists changes in current by inducing a opposing voltage.', 'medium'],
  ]),
  ...questionGroup('ectle', 'ectle-basics', 'ectle-basics-semi', [
    ['A PN junction diode conducts when it is:', ['forward biased', 'reverse biased', 'unbiased', 'at breakdown always'], 0, 'Forward bias lowers the barrier potential and allows current to flow.', 'easy'],
    ['In an NPN transistor, the arrow on the emitter points:', ['toward the base', 'outward, away from the base', 'inward, toward the base', 'there is no arrow'], 1, 'The NPN arrow points outward — “Not Pointing iN”.', 'medium'],
    ['A Zener diode is primarily used for:', ['amplification', 'voltage regulation', 'rectification only', 'light emission'], 1, 'Zener diodes operate in reverse breakdown to maintain a reference voltage.', 'medium'],
  ]),
  ...questionGroup('ectle', 'ectle-digital', 'ectle-dig-logic', [
    ['The output of an OR gate is HIGH when:', ['all inputs are LOW', 'at least one input is HIGH', 'inputs are different', 'all inputs are HIGH only'], 1, 'An OR gate outputs HIGH if any input is HIGH.', 'easy'],
    ['An XOR gate outputs 1 when:', ['both inputs are 0', 'both inputs are 1', 'the inputs are different', 'either input is 1'], 2, 'XOR (exclusive OR) is true only when the inputs differ.', 'easy'],
    ['De Morgan’s theorem states that (A·B)′ equals:', ['A′·B′', 'A′ + B′', 'A + B', 'A·B'], 1, 'De Morgan: the complement of a product equals the sum of the complements.', 'medium'],
  ]),
  ...questionGroup('ectle', 'ectle-digital', 'ectle-dig-systems', [
    ['The binary number 1010 is equal to the decimal value:', ['8', '9', '10', '12'], 2, '1010₂ = 8 + 0 + 2 + 0 = 10.', 'easy'],
    ['The hexadecimal digit F represents the decimal value:', ['10', '14', '15', '16'], 2, 'Hex digits run 0–9 then A=10 through F=15.', 'easy'],
    ['One byte consists of:', ['4 bits', '8 bits', '16 bits', '32 bits'], 1, 'A byte is 8 bits and can represent 256 distinct values.', 'easy'],
  ]),
  ...questionGroup('ectle', 'ectle-electrical', 'ectle-elec-dc', [
    ['An ammeter must be connected:', ['in parallel with the load', 'in series with the load', 'across the supply only', 'to ground only'], 1, 'An ammeter measures current and must be placed in series so the same current flows through it.', 'easy'],
    ['A good voltmeter has:', ['very low internal resistance', 'very high internal resistance', 'zero internal resistance', 'no internal resistance'], 1, 'High internal resistance minimises the current drawn from the circuit under test.', 'medium'],
    ['The power dissipated in a resistor can be computed as:', ['P = V × I', 'P = I²R', 'P = V²/R', 'All of the above'], 3, 'All three expressions are equivalent via Ohm’s law.', 'easy'],
  ]),
  ...questionGroup('ectle', 'ectle-electrical', 'ectle-elec-ac', [
    ['The standard mains frequency in the Philippines is:', ['50 Hz', '60 Hz', '100 Hz', '400 Hz'], 1, 'Philippine mains power is nominally 220 V at 60 Hz.', 'easy'],
    ['The RMS value of a 220 V AC mains rating refers to:', ['peak voltage', 'average voltage', 'effective voltage', 'peak-to-peak voltage'], 2, 'AC voltage ratings are normally RMS (effective) values.', 'medium'],
    ['Power factor is defined as:', ['the ratio of real to apparent power', 'the ratio of apparent to real power', 'the sine of the phase angle', 'the supply frequency'], 0, 'PF = cos φ = real power / apparent power.', 'medium'],
  ]),
  ...questionGroup('ectle', 'ectle-comm', 'ectle-comm-radio', [
    ['Modulation is the process of:', ['amplifying a carrier', 'varying a carrier with an information signal', 'filtering noise only', 'converting AC to DC'], 1, 'Modulation impresses information onto a high-frequency carrier for transmission.', 'easy'],
    ['The standard AM broadcast band extends approximately from:', ['530 to 1700 kHz', '88 to 108 MHz', '3 to 30 MHz', '1 to 2 GHz'], 0, 'The AM broadcast band is roughly 530–1700 kHz (medium wave).', 'medium'],
    ['A quarter-wave antenna at 100 MHz is approximately:', ['0.075 m', '0.75 m', '3 m', '7.5 m'], 1, 'λ = 3 m at 100 MHz, so λ/4 = 0.75 m.', 'medium'],
  ]),
  ...questionGroup('ectle', 'ectle-comm', 'ectle-comm-data', [
    ['The connector most commonly used for twisted-pair Ethernet is:', ['RJ11', 'RJ45', 'BNC', 'USB-C'], 1, 'Ethernet over twisted pair uses an 8-position RJ45 connector.', 'easy'],
    ['A network hub operates at which OSI layer?', ['Physical', 'Data Link', 'Network', 'Transport'], 0, 'A hub simply repeats electrical signals and works at the physical layer.', 'medium'],
    ['Category 5e cable supports data rates up to:', ['10 Mbps', '100 Mbps', '1 Gbps', '10 Gbps'], 2, 'Cat5e is specified for Gigabit Ethernet (1000BASE-T) up to 100 m.', 'medium'],
  ]),
  ...questionGroup('ectle', 'ectle-industrial', 'ectle-ind-control', [
    ['A relay is best described as:', ['a solid-state amplifier', 'an electrically operated switch', 'a voltage regulator', 'a current source'], 1, 'A relay uses an electromagnet to open or close contacts, isolating control from load.', 'easy'],
    ['The synchronous speed of an induction motor depends on:', ['supply frequency and number of poles', 'load torque only', 'armature resistance', 'ambient temperature'], 0, 'Ns = 120f / P, so speed depends on frequency and pole count.', 'medium'],
    ['PLC stands for:', ['Programmable Logic Controller', 'Power Line Conduit', 'Personal Logic Circuit', 'Programmed Load Control'], 0, 'A PLC is a ruggedised digital computer used for industrial automation.', 'easy'],
  ]),
  ...questionGroup('ectle', 'ectle-industrial', 'ectle-ind-safety', [
    ['Before servicing electrical equipment, you should first:', ['remove the fuse only', 'disconnect and lock out the power supply', 'wear thin gloves', 'increase the load'], 1, 'Lockout/tagout and de-energising the circuit is the essential first safety step.', 'easy'],
    ['A fuse primarily protects a circuit against:', ['overvoltage', 'overcurrent', 'low frequency', 'reverse polarity'], 1, 'A fuse opens the circuit when current exceeds its rated value.', 'easy'],
    ['Equipping metal enclosures with a safety ground helps prevent:', ['electric shock', 'voltage sag', 'radio interference', 'power factor penalty'], 0, 'Grounding provides a low-resistance fault path so protective devices trip quickly.', 'medium'],
  ]),
  ...questionGroup('ectle', 'ectle-practical', 'ectle-prac-soldering', [
    ['Traditional solder is an alloy mainly of:', ['copper and zinc', 'tin and lead', 'silver and gold', 'aluminium and iron'], 1, 'Conventional solder is a tin-lead alloy; lead-free variants use tin with silver/copper.', 'easy'],
    ['Before use, the tip of a soldering iron should be:', ['painted', 'tinned', 'sandblasted', 'oiled'], 1, 'Tinning the tip with solder improves heat transfer and prevents oxidation.', 'medium'],
    ['On an IC package, the notch or dot identifies:', ['pin 1', 'the last pin', 'ground only', 'the negative supply'], 0, 'The notch/dot marks pin 1 and the pins are then counted counter-clockwise.', 'medium'],
  ]),
  ...questionGroup('ectle', 'ectle-practical', 'ectle-prac-instruments', [
    ['An oscilloscope primarily displays:', ['current versus temperature', 'voltage versus time', 'resistance versus frequency', 'power versus time'], 1, 'An oscilloscope plots instantaneous voltage on the vertical axis against time horizontally.', 'easy'],
    ['A digital multimeter can typically measure:', ['voltage, current and resistance', 'only voltage', 'only current', 'frequency only'], 0, 'The common DMM measures volts, amps and ohms, often with extra functions.', 'easy'],
    ['A function generator is used to produce:', ['DC power only', 'test waveforms such as sine and square', 'high-voltage transmission', 'mechanical rotation'], 1, 'Function generators create repeatable test signals at adjustable frequency and amplitude.', 'easy'],
  ]),
]

type FlashcardSeed = [front: string, back: string]

function flashcardGroup(
  programId: ProgramId,
  subjectId: string,
  topicId: string,
  items: FlashcardSeed[],
): Flashcard[] {
  return items.map(([front, back], index) => ({
    id: `${topicId}-f${index + 1}`,
    programId,
    subjectId,
    topicId,
    front,
    back,
  }))
}

export const flashcards: Flashcard[] = [
  ...flashcardGroup('ecele', 'ecele-math', 'ecele-math-algebra', [
    ['logₐ(b) = c means…', 'aᶜ = b'],
    ['Magnitude of a complex number a + bi', '√(a² + b²)'],
    ['sin²θ + cos²θ =', '1'],
  ]),
  ...flashcardGroup('ecele', 'ecele-math', 'ecele-math-calculus', [
    ['Derivative of xⁿ', 'n·xⁿ⁻¹'],
    ['∫ xⁿ dx (n ≠ −1)', 'xⁿ⁺¹/(n+1) + C'],
  ]),
  ...flashcardGroup('ecele', 'ecele-electronics', 'ecele-el-devices', [
    ['Forward drop of a silicon diode', '≈ 0.7 V'],
    ['Phase shift of a common-emitter amplifier', '180°'],
    ['BJT current gain β', 'Ic / Ib'],
  ]),
  ...flashcardGroup('ecele', 'ecele-electronics', 'ecele-el-digital', [
    ['NAND output is 0 when…', 'all inputs are 1'],
    ['A + Ā', '1'],
    ['Values representable with n bits', '2ⁿ'],
  ]),
  ...flashcardGroup('ecele', 'ecele-emag', 'ecele-em-fields', [
    ['Speed of light in free space', '≈ 3 × 10⁸ m/s'],
    ['Wave relationship', 'c = fλ'],
    ['Unit of magnetic flux density', 'Tesla (T)'],
  ]),
  ...flashcardGroup('ecele', 'ecele-emag', 'ecele-em-transmission', [
    ['Characteristic impedance of a lossless line', 'Zo = √(L/C)'],
    ['VSWR for a perfect match', '1'],
  ]),
  ...flashcardGroup('ecele', 'ecele-comm', 'ecele-comm-analog', [
    ['Nyquist sampling criterion', 'fs ≥ 2fm'],
    ['AM modulation index', '(Emax − Emin)/(Emax + Emin)'],
  ]),
  ...flashcardGroup('ecele', 'ecele-comm', 'ecele-comm-digital', [
    ['Bits in an IPv4 address', '32'],
    ['BER of 10⁻⁶ means', '1 error per million bits'],
  ]),
  ...flashcardGroup('ecele', 'ecele-circuits', 'ecele-ckt-dc', [
    ['Ohm’s law', 'V = I R'],
    ['Power in a resistor', 'P = I²R = V²/R'],
  ]),
  ...flashcardGroup('ecele', 'ecele-circuits', 'ecele-ckt-ac', [
    ['RMS of a sinusoid', 'Vp / √2'],
    ['At series resonance', 'XL = XC'],
  ]),
  ...flashcardGroup('ecele', 'ecele-econ', 'ecele-econ-interest', [
    ['Simple interest formula', 'I = P r t'],
    ['Annuity', 'Equal payments at equal intervals'],
  ]),
  ...flashcardGroup('ecele', 'ecele-econ', 'ecele-econ-ethics', [
    ['Highest duty in engineering ethics', 'Public safety, health and welfare'],
    ['Bid rigging', 'Unethical and illegal'],
  ]),

  ...flashcardGroup('ectle', 'ectle-basics', 'ectle-basics-components', [
    ['Resistor bands brown–black–red', '1 kΩ (± tolerance band)'],
    ['Energy stored in a capacitor', 'Electric field'],
    ['Component that opposes change in current', 'Inductor'],
  ]),
  ...flashcardGroup('ectle', 'ectle-basics', 'ectle-basics-semi', [
    ['Diode conducts when…', 'Forward biased'],
    ['NPN emitter arrow', 'Points outward (Not Pointing iN)'],
    ['Zener diode application', 'Voltage regulation'],
  ]),
  ...flashcardGroup('ectle', 'ectle-digital', 'ectle-dig-logic', [
    ['XOR output is 1 when', 'Inputs are different'],
    ['De Morgan: (A·B)′', 'A′ + B′'],
  ]),
  ...flashcardGroup('ectle', 'ectle-digital', 'ectle-dig-systems', [
    ['1010₂ in decimal', '10'],
    ['One byte', '8 bits'],
  ]),
  ...flashcardGroup('ectle', 'ectle-electrical', 'ectle-elec-dc', [
    ['Ammeter connection', 'In series with the load'],
    ['Voltmeter input resistance', 'Very high'],
  ]),
  ...flashcardGroup('ectle', 'ectle-electrical', 'ectle-elec-ac', [
    ['Philippine mains frequency', '60 Hz'],
    ['Power factor', 'cos φ = real / apparent power'],
  ]),
  ...flashcardGroup('ectle', 'ectle-comm', 'ectle-comm-radio', [
    ['Purpose of modulation', 'Impress information onto a carrier'],
    ['AM broadcast band', '≈ 530–1700 kHz'],
  ]),
  ...flashcardGroup('ectle', 'ectle-comm', 'ectle-comm-data', [
    ['Ethernet twisted-pair connector', 'RJ45'],
    ['OSI layer of a hub', 'Physical (Layer 1)'],
  ]),
  ...flashcardGroup('ectle', 'ectle-industrial', 'ectle-ind-control', [
    ['Relay', 'Electrically operated switch'],
    ['Synchronous speed formula', 'Ns = 120f / P'],
  ]),
  ...flashcardGroup('ectle', 'ectle-industrial', 'ectle-ind-safety', [
    ['First step before servicing', 'De-energise and lock out/tag out'],
    ['Purpose of a fuse', 'Overcurrent protection'],
  ]),
  ...flashcardGroup('ectle', 'ectle-practical', 'ectle-prac-soldering', [
    ['Traditional solder alloy', 'Tin and lead'],
    ['Marks pin 1 on an IC', 'Notch or dot'],
  ]),
  ...flashcardGroup('ectle', 'ectle-practical', 'ectle-prac-instruments', [
    ['Oscilloscope displays', 'Voltage versus time'],
    ['Function generator', 'Produces test waveforms'],
  ]),
]

export const seedCatalog: Catalog = {
  programs,
  subjects,
  topics,
  questions,
  flashcards,
}
