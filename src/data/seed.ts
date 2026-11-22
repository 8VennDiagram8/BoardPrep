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
    name: 'Electronics Engineering Licensure Examination',
    shortName: 'Electronics Engineering',
    description:
      'The PRC board exam for Electronics Engineers. Master circuits, devices, electromagnetics and communications.',
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
    id: 'ecele-elecs',
    programId: 'ecele',
    name: 'Electronics Engineering',
    code: 'ELECS',
    description: 'DC/AC circuits, devices, logic design, microcontrollers and control systems.',
    glyph: '⚡',
  },
  {
    id: 'ecele-est',
    programId: 'ecele',
    name: 'Electronics Systems and Technologies',
    code: 'EST',
    description: 'Signals, communications, transmission, data networks and CAD.',
    glyph: '📶',
  },
  {
    id: 'ecele-math',
    programId: 'ecele',
    name: 'Mathematics',
    code: 'MATH',
    description: 'Calculus, differential equations, advanced engineering math and data analysis.',
    glyph: '∑',
  },
  {
    id: 'ecele-geas',
    programId: 'ecele',
    name: 'General Engineering & Applied Sciences',
    code: 'GEAS',
    description: 'Chemistry, physics, economics, management, laws, ethics, safety and CAD.',
    glyph: '📊',
  },
  // ---------------------------------------------------------------- ECTLE
  {
    id: 'ectle-technical',
    programId: 'ectle',
    name: 'Technical Subjects and Laws and Ethics',
    code: 'TECH',
    description: 'Mathematics, circuits, equipment, codes and the Electronics Engineering Law.',
    glyph: '🧰',
  },
]

type TopicSeed = [id: string, subjectId: string, programId: ProgramId, name: string, description: string]

const topicSeeds: TopicSeed[] = [
  // ECELE — ELECS
  ['ecele-elecs-dc', 'ecele-elecs', 'ecele', 'DC Electrical Circuits', 'Ohm’s law, resistors and network theorems'],
  ['ecele-elecs-ac', 'ecele-elecs', 'ecele', 'AC Electrical Circuits', 'Phasors, RMS, resonance and AC power'],
  ['ecele-elecs-emag', 'ecele-elecs', 'ecele', 'Electromagnetics', 'Fields, waves and Maxwell’s equations'],
  ['ecele-elecs-devices', 'ecele-elecs', 'ecele', 'Electronic Devices and Circuits', 'Diodes, BJTs, FETs and amplifier basics'],
  ['ecele-elecs-circuit-design', 'ecele-elecs', 'ecele', 'Electronic Circuit Analysis and Design', 'Op-amps, Thevenin/Norton and filter design'],
  ['ecele-elecs-systems', 'ecele-elecs', 'ecele', 'Electronic Systems and Design', 'Rectifiers, power supplies and system integration'],
  ['ecele-elecs-logic', 'ecele-elecs', 'ecele', 'Logic Circuits and Switching Theory', 'Gates, Boolean algebra and combinational logic'],
  ['ecele-elecs-micro', 'ecele-elecs', 'ecele', 'Microprocessor & Microcontroller Systems and Design', 'Architectures, interrupts and interfacing'],
  ['ecele-elecs-control', 'ecele-elecs', 'ecele', 'Feedback and Control Systems', 'Closed-loop transfer functions and stability'],
  // ECELE — EST
  ['ecele-est-signals', 'ecele-est', 'ecele', 'Signals, Spectra, and Signal Processing', 'Fourier analysis, sampling and convolution'],
  ['ecele-est-principles', 'ecele-est', 'ecele', 'Principles of Communications', 'Modulation, demodulation and noise'],
  ['ecele-est-digital-comm', 'ecele-est', 'ecele', 'Digital Communications', 'Coding, error rates and digital modulation'],
  ['ecele-est-transmission', 'ecele-est', 'ecele', 'Transmission and Antenna Systems', 'Lines, impedance matching and antennas'],
  ['ecele-est-systems', 'ecele-est', 'ecele', 'Electronic Systems and Design', 'Amplifiers, filters and decibel gain'],
  ['ecele-est-data', 'ecele-est', 'ecele', 'Data Communications', 'Networking fundamentals, protocols and addressing'],
  ['ecele-est-cad', 'ecele-est', 'ecele', 'CAD', 'Computer-aided circuit design and PCB tools'],
  // ECELE — MATH
  ['ecele-math-diff', 'ecele-math', 'ecele', 'Differential Calculus', 'Derivatives, rules and applications'],
  ['ecele-math-int', 'ecele-math', 'ecele', 'Integral Calculus', 'Antiderivatives and definite integrals'],
  ['ecele-math-de', 'ecele-math', 'ecele', 'Differential Equation', 'First and higher order ODEs'],
  ['ecele-math-advanced', 'ecele-math', 'ecele', 'Advanced Engineering Mathematics for ECE', 'Laplace transforms, complex variables and series'],
  ['ecele-math-data', 'ecele-math', 'ecele', 'Engineering Data Analysis', 'Statistics, probability and distributions'],
  ['ecele-math-emag', 'ecele-math', 'ecele', 'Electromagnetics', 'Vector calculus applied to fields and potentials'],
  ['ecele-math-signals', 'ecele-math', 'ecele', 'Signals, Spectra, and Signal Processing', 'Transforms and spectral analysis for engineers'],
  ['ecele-math-control', 'ecele-math', 'ecele', 'Feedback and Control Systems', 'Stability criteria, root locus and poles'],
  // ECELE — GEAS
  ['ecele-geas-chem', 'ecele-geas', 'ecele', 'Chemistry for Engineers', 'Atomic structure, bonding, pH and stoichiometry'],
  ['ecele-geas-physics', 'ecele-geas', 'ecele', 'Physics for Engineers', 'Mechanics, energy and motion'],
  ['ecele-geas-econ', 'ecele-geas', 'ecele', 'Engineering Economics', 'Interest, annuities and cash flow'],
  ['ecele-geas-management', 'ecele-geas', 'ecele', 'Engineering Management', 'Project scheduling, PERT and Gantt charts'],
  ['ecele-geas-techno', 'ecele-geas', 'ecele', 'Technopreneurship 101', 'Business models, value proposition and funding'],
  ['ecele-geas-physics2', 'ecele-geas', 'ecele', 'Physics 2', 'Electrostatics, fields and magnetism'],
  ['ecele-geas-materials', 'ecele-geas', 'ecele', 'Materials Science and Engineering', 'Alloys, crystal structure and material properties'],
  ['ecele-geas-programming', 'ecele-geas', 'ecele', 'Computer Programming', 'Variables, control flow and algorithms'],
  ['ecele-geas-environment', 'ecele-geas', 'ecele', 'Environmental Science and Engineering', 'Pollution, waste management and sustainability'],
  ['ecele-geas-law', 'ecele-geas', 'ecele', 'ECE Laws, Contracts, Ethics, Standards & Safety', 'PRC laws, codes of ethics and workplace safety'],
  ['ecele-geas-cad', 'ecele-geas', 'ecele', 'CAD', 'Drafting standards, schematics and manufacturing files'],
  // ECTLE
  ['ectle-math-basic', 'ectle-technical', 'ectle', 'Basic Mathematics', 'Arithmetic, algebra and applied calculations'],
  ['ectle-ohm-law', 'ectle-technical', 'ectle', "Ohm's Law", 'Voltage, current, resistance and power'],
  ['ectle-machines', 'ectle-technical', 'ectle', 'Electronic/Electrical Machine or Equipment', 'Motors, generators, transformers and appliances'],
  ['ectle-test-equipment', 'ectle-technical', 'ectle', 'Test Equipment', 'Multimeters, oscilloscopes and signal generators'],
  ['ectle-components', 'ectle-technical', 'ectle', 'Electronic/Electrical Component', 'Resistors, capacitors, diodes and transistors'],
  ['ectle-maintenance', 'ectle-technical', 'ectle', 'Maintenance and Repair', 'Troubleshooting, soldering and preventive maintenance'],
  ['ectle-pec-electronics', 'ectle-technical', 'ectle', 'Philippine Electronics Code volume 1 and volume 2', 'Electronics code provisions and safety standards'],
  ['ectle-pec-electrical', 'ectle-technical', 'ectle', 'Philippine Electrical Code', 'Wiring, grounding and overcurrent protection'],
  ['ectle-ra9292', 'ectle-technical', 'ectle', 'Republic act 9292 Electronics Engineering Law of 2004', 'The Electronics Engineering Law, PRC regulation and ethics'],
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
  // ELECS
  ...questionGroup('ecele', 'ecele-elecs', 'ecele-elecs-dc', [
    ['A 12 V source is connected to a 4 Ω resistor. What is the current?', ['2 A', '3 A', '4 A', '48 A'], 1, 'By Ohm’s law, I = V / R = 12 / 4 = 3 A.', 'easy'],
    ['Two resistors of 4 Ω and 6 Ω connected in series have an equivalent resistance of:', ['2.4 Ω', '10 Ω', '5 Ω', '24 Ω'], 1, 'Series resistances add directly: 4 + 6 = 10 Ω.', 'easy'],
    ['The power dissipated by a 2 Ω resistor carrying 3 A is:', ['6 W', '12 W', '18 W', '36 W'], 2, 'P = I²R = 3² × 2 = 18 W.', 'medium'],
  ]),
  ...questionGroup('ecele', 'ecele-elecs', 'ecele-elecs-ac', [
    ['For a sinusoid with peak voltage Vp, the RMS voltage is:', ['Vp / 2', 'Vp / √2', 'Vp × √2', 'Vp'], 1, 'Vrms = Vp / √2 ≈ 0.707 Vp for a sine wave.', 'easy'],
    ['In a purely capacitive AC circuit, the current:', ['leads voltage by 90°', 'lags voltage by 90°', 'is in phase with voltage', 'leads by 180°'], 0, 'For a capacitor, current leads voltage by 90° (ICE).', 'medium'],
    ['Series resonance in an RLC circuit occurs when:', ['XL > XC', 'XL < XC', 'XL = XC', 'R = 0'], 2, 'At resonance the inductive and capacitive reactances cancel: XL = XC.', 'medium'],
  ]),
  ...questionGroup('ecele', 'ecele-elecs', 'ecele-elecs-emag', [
    ['What is the approximate speed of an electromagnetic wave in free space?', ['3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s', '1.5 × 10⁸ m/s'], 1, 'The speed of light in vacuum is approximately 3 × 10⁸ m/s.', 'easy'],
    ['A wave has a frequency of 100 MHz. What is its wavelength in free space?', ['0.3 m', '3 m', '30 m', '300 m'], 1, 'λ = c / f = (3 × 10⁸) / (1 × 10⁸) = 3 m.', 'medium'],
    ['The SI unit of magnetic flux density (B) is the:', ['Weber', 'Tesla', 'Henry', 'Gauss'], 1, 'Magnetic flux density is measured in tesla (T); weber is the unit of flux.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-elecs', 'ecele-elecs-devices', [
    ['What is the approximate forward voltage drop of a silicon diode?', ['0.2 V', '0.3 V', '0.7 V', '1.4 V'], 2, 'A forward-biased silicon diode typically drops about 0.7 V; germanium drops about 0.3 V.', 'easy'],
    ['In a common-emitter BJT amplifier, what is the phase relationship between input and output?', ['0°', '90°', '180°', '270°'], 2, 'A common-emitter stage inverts the signal, producing a 180° phase shift.', 'medium'],
    ['The current gain β of a BJT is defined as:', ['Ic / Ib', 'Ib / Ic', 'Ie / Ib', 'Ic / Ie'], 0, 'β (hFE) is the ratio of collector current to base current.', 'medium'],
  ]),
  ...questionGroup('ecele', 'ecele-elecs', 'ecele-elecs-circuit-design', [
    ['An inverting op-amp has Rin = 2 kΩ and Rf = 10 kΩ. What is its closed-loop gain?', ['−2', '−5', '+5', '+12'], 1, 'For an ideal inverting amplifier, gain = −Rf/Rin = −10/2 = −5.', 'medium'],
    ['The Thevenin equivalent of a linear network consists of:', ['a current source in parallel with a resistor', 'a voltage source in series with a resistor', 'a voltage source in parallel with a capacitor', 'a resistor only'], 1, 'Thevenin’s theorem reduces a network to Vth in series with Rth.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-elecs', 'ecele-elecs-systems', [
    ['How many diodes are used in a full-wave bridge rectifier?', ['2', '4', '6', '8'], 1, 'A bridge rectifier uses four diodes arranged in a diamond configuration.', 'easy'],
    ['The main purpose of a filter in a DC power supply is to:', ['increase ripple', 'reduce ripple', 'raise the frequency', 'invert the polarity'], 1, 'Filtering smooths the rectified waveform by reducing residual AC ripple.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-elecs', 'ecele-elecs-logic', [
    ['A NAND gate output is LOW only when:', ['all inputs are LOW', 'any input is HIGH', 'all inputs are HIGH', 'inputs are equal'], 2, 'NAND is the inverse of AND: it is LOW only when every input is HIGH.', 'easy'],
    ['Using Boolean algebra, A + Ā equals:', ['0', '1', 'A', 'Ā'], 1, 'The complement law states that a variable ORed with its complement always equals 1.', 'easy'],
    ['How many distinct values can a 4-bit binary word represent?', ['8', '15', '16', '32'], 2, 'An n-bit word represents 2ⁿ values, so 2⁴ = 16 (0 through 15).', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-elecs', 'ecele-elecs-micro', [
    ['A microcontroller integrates which of the following on a single chip?', ['CPU, memory and peripherals', 'only a CPU', 'only memory', 'only an oscillator'], 0, 'A microcontroller combines processor, memory and I/O peripherals in one package.', 'easy'],
    ['An interrupt causes the processor to:', ['halt permanently', 'temporarily suspend the current task to service an event', 'increase its clock speed', 'reset all memory'], 1, 'Interrupts redirect execution to a service routine, then return to the interrupted task.', 'medium'],
  ]),
  ...questionGroup('ecele', 'ecele-elecs', 'ecele-elecs-control', [
    ['Compared with an open-loop system, negative feedback generally:', ['increases gain and reduces stability', 'reduces gain and improves stability', 'has no effect on gain', 'eliminates the need for gain'], 1, 'Negative feedback trades gain for improved stability, bandwidth and accuracy.', 'medium'],
    ['For a forward path G(s) and feedback H(s), the closed-loop transfer function with negative feedback is:', ['G / (1 + GH)', 'G / (1 − GH)', 'GH / (1 + G)', '1 + GH'], 0, 'The standard negative-feedback closed-loop form is T(s) = G(s) / (1 + G(s)H(s)).', 'hard'],
  ]),
  // EST
  ...questionGroup('ecele', 'ecele-est', 'ecele-est-signals', [
    ['The Fourier transform of a time-domain signal gives its:', ['phase spectrum only', 'frequency spectrum', 'time derivative', 'DC value only'], 1, 'The Fourier transform maps a signal from the time domain to the frequency domain.', 'easy'],
    ['According to the Nyquist sampling theorem, the sampling frequency must be:', ['equal to fm', 'at least 2fm', 'at most 2fm', 'half of fm'], 1, 'To avoid aliasing, fs must be at least twice the highest message frequency.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-est', 'ecele-est-principles', [
    ['For an AM wave, the modulation index m is given by:', ['(Emax − Emin) / (Emax + Emin)', '(Emax + Emin) / (Emax − Emin)', 'Emax / Emin', 'Emin / Emax'], 0, 'The modulation index is computed from the envelope maxima and minima.', 'medium'],
    ['Which modulation scheme keeps the carrier amplitude constant?', ['AM', 'FM', 'ASK', 'PAM'], 1, 'Frequency modulation varies frequency while the amplitude remains constant.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-est', 'ecele-est-digital-comm', [
    ['The theoretical minimum bandwidth for binary baseband signalling at bit rate Rb is:', ['Rb', 'Rb/2', '2Rb', '4Rb'], 1, 'Nyquist’s criterion gives a minimum bandwidth of Rb/2 Hz for ideal binary signalling.', 'hard'],
    ['A bit error rate of 10⁻⁶ means:', ['1 error per 10 bits', '1 error per 1,000 bits', '1 error per 1,000,000 bits', '1 error per 100 bits'], 2, 'BER is the ratio of erroneous bits to total transmitted bits, so 10⁻⁶ = 1 in a million.', 'medium'],
  ]),
  ...questionGroup('ecele', 'ecele-est', 'ecele-est-transmission', [
    ['For a lossless transmission line, the characteristic impedance is:', ['Zo = √(L/C)', 'Zo = √(C/L)', 'Zo = L/C', 'Zo = LC'], 0, 'The lossless line impedance is Zo = √(L/C), purely real.', 'medium'],
    ['A VSWR of exactly 1 indicates:', ['a complete mismatch', 'a perfect match', 'a short circuit', 'an open circuit'], 1, 'VSWR = 1 means no reflected wave — the load is perfectly matched to the line.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-est', 'ecele-est-systems', [
    ['A filter that passes all frequencies below a cutoff frequency is a:', ['high-pass filter', 'low-pass filter', 'band-stop filter', 'notch filter'], 1, 'A low-pass filter passes frequencies from DC up to its cutoff frequency.', 'easy'],
    ['The bandwidth of an amplifier is defined as:', ['the upper cutoff frequency only', 'the difference between upper and lower cutoff frequencies', 'the gain at DC', 'the sum of cutoff frequencies'], 1, 'Bandwidth = fH − fL for a band-limited amplifier.', 'medium'],
  ]),
  ...questionGroup('ecele', 'ecele-est', 'ecele-est-data', [
    ['An IPv4 address consists of:', ['16 bits', '32 bits', '64 bits', '128 bits'], 1, 'IPv4 uses 32-bit addresses, usually written in dotted-decimal notation.', 'easy'],
    ['The connector most commonly used for twisted-pair Ethernet is:', ['RJ11', 'RJ45', 'BNC', 'USB-C'], 1, 'Ethernet over twisted pair uses an 8-position RJ45 connector.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-est', 'ecele-est-cad', [
    ['CAD stands for:', ['Computer-Aided Design', 'Circuit Analysis and Design', 'Computer-Assisted Diagnostics', 'Centralized Array Data'], 0, 'CAD is the use of computer systems to aid in design and drafting.', 'easy'],
    ['Which file format is standard for PCB fabrication artwork?', ['PDF', 'Gerber', 'JPEG', 'MP3'], 1, 'Gerber files describe the copper layers, solder mask and silkscreen for PCB manufacturing.', 'medium'],
  ]),
  // MATH
  ...questionGroup('ecele', 'ecele-math', 'ecele-math-diff', [
    ['What is the derivative of f(x) = x³ + 2x?', ['3x² + 2', '3x² + 2x', 'x² + 2', '3x + 2'], 0, 'Apply the power rule: d/dx(x³) = 3x² and d/dx(2x) = 2.', 'easy'],
    ['The derivative of sin x with respect to x is:', ['−sin x', 'cos x', '−cos x', 'tan x'], 1, 'The basic trigonometric derivative is d(sin x)/dx = cos x.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-math', 'ecele-math-int', [
    ['Evaluate ∫ 2x dx.', ['x² + C', '2 + C', 'x + C', '2x² + C'], 0, 'The antiderivative of 2x is x²; always add the constant of integration C.', 'easy'],
    ['A definite integral of a positive function over [a, b] gives the:', ['slope at b', 'area under the curve', 'average value only', 'length of the curve'], 1, 'The definite integral equals the signed area between the curve and the x-axis.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-math', 'ecele-math-de', [
    ['The order of a differential equation is defined as:', ['the highest power of a derivative', 'the highest derivative present', 'the number of variables', 'the number of terms'], 1, 'Order is determined by the highest-order derivative that appears.', 'easy'],
    ['The general solution of dy/dx = ky is:', ['y = kx + C', 'y = Ce^{kx}', 'y = C/k', 'y = k ln x + C'], 1, 'Separating variables and integrating gives ln|y| = kx + C, so y = Ce^{kx}.', 'medium'],
  ]),
  ...questionGroup('ecele', 'ecele-math', 'ecele-math-advanced', [
    ['The Laplace transform of e^{at} is:', ['1/(s − a)', '1/(s + a)', 'a/(s² + a²)', 's/(s² − a²)'], 0, 'L{e^{at}} = ∫₀∞ e^{−st}e^{at} dt = 1/(s − a) for s > a.', 'medium'],
    ['The magnitude of a complex number a + bi is:', ['a² + b²', '√(a² + b²)', 'a + b', '√(a² − b²)'], 1, 'Magnitude (modulus) is the distance from the origin in the complex plane.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-math', 'ecele-math-data', [
    ['Find the mean of the data set {2, 4, 6, 8}.', ['4', '5', '6', '7'], 1, 'Mean = (2 + 4 + 6 + 8) / 4 = 20 / 4 = 5.', 'easy'],
    ['For a normal distribution, approximately what percentage of values lie within ±1 standard deviation of the mean?', ['50%', '68%', '95%', '99.7%'], 1, 'The empirical rule gives about 68% within one sigma.', 'medium'],
  ]),
  ...questionGroup('ecele', 'ecele-math', 'ecele-math-emag', [
    ['Maxwell’s equations collectively describe the relationship between:', ['electric and magnetic fields', 'heat and work', 'stress and strain', 'pressure and volume'], 0, 'Maxwell’s equations unify electricity and magnetism into electromagnetics.', 'easy'],
    ['Electric flux density D is related to electric field intensity E by:', ['D = E / ε', 'D = εE', 'D = μH', 'D = E × H'], 1, 'In a linear isotropic medium, D = εE.', 'medium'],
  ]),
  ...questionGroup('ecele', 'ecele-math', 'ecele-math-signals', [
    ['Convolution in the time domain corresponds to what operation in the frequency domain?', ['addition', 'multiplication', 'division', 'differentiation'], 1, 'The convolution theorem states that time-domain convolution equals frequency-domain multiplication.', 'medium'],
    ['The unit impulse δ(t) has an area (integral over all time) equal to:', ['0', '1', '∞', 'depends on amplitude'], 1, 'By definition, ∫δ(t)dt = 1 over all time.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-math', 'ecele-math-control', [
    ['For a stable continuous-time closed-loop system, all poles must lie in:', ['the right half-plane', 'the left half-plane', 'on the imaginary axis', 'at the origin'], 1, 'Stability requires all closed-loop poles to have negative real parts.', 'medium'],
    ['The Routh–Hurwitz criterion is used to determine:', ['frequency response bandwidth', 'stability from characteristic equation coefficients', 'signal-to-noise ratio', 'sampling rate'], 1, 'Routh–Hurwitz tests stability without explicitly solving for roots.', 'hard'],
  ]),
  // GEAS
  ...questionGroup('ecele', 'ecele-geas', 'ecele-geas-chem', [
    ['The pH of a solution is defined as:', ['−log[H⁺]', 'log[H⁺]', '[H⁺]²', '1/[OH⁻]'], 0, 'pH = −log₁₀ of the hydrogen ion concentration.', 'easy'],
    ['How many particles are in one mole of a substance?', ['6.022 × 10²³', '3.14 × 10⁸', '9.81 × 10²³', '1.602 × 10⁻¹⁹'], 0, 'Avogadro’s number is approximately 6.022 × 10²³ particles per mole.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-geas', 'ecele-geas-physics', [
    ['Newton’s second law of motion states that:', ['F = m/a', 'F = ma', 'F = mv', 'F = m/a²'], 1, 'Net force equals mass times acceleration.', 'easy'],
    ['The kinetic energy of a mass m moving at speed v is:', ['mv', '½mv²', 'mgh', 'mv²'], 1, 'KE = ½mv².', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-geas', 'ecele-geas-econ', [
    ['The simple interest on ₱1,000 at 10% per year for 2 years is:', ['₱100', '₱200', '₱220', '₱1,200'], 1, 'I = P × r × t = 1000 × 0.10 × 2 = ₱200.', 'easy'],
    ['An annuity is best described as:', ['a single lump-sum payment', 'a series of equal payments at equal intervals', 'a one-time investment', 'an irregular cash inflow'], 1, 'An annuity is a sequence of equal payments made at regular time intervals.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-geas', 'ecele-geas-management', [
    ['In PERT, the expected activity time is computed as:', ['(O + M + P) / 3', '(O + 4M + P) / 6', '(O + 2M + P) / 4', '(O + P) / 2'], 1, 'PERT expected time = (optimistic + 4×most likely + pessimistic) / 6.', 'medium'],
    ['The critical path of a project is:', ['the shortest path through the network', 'the longest path and determines project duration', 'the path with the most resources', 'always the first activity'], 1, 'The longest-duration path sets the minimum project completion time.', 'medium'],
  ]),
  ...questionGroup('ecele', 'ecele-geas', 'ecele-geas-techno', [
    ['A business model canvas primarily describes:', ['how a company creates, delivers and captures value', 'only the financial statements', 'the circuit schematic', 'the org chart only'], 0, 'The canvas maps key partners, activities, resources, value propositions, customers and revenue.', 'easy'],
    ['A value proposition explains:', ['why customers should choose your product', 'the company’s tax obligations', 'the manufacturing cost only', 'the legal structure'], 0, 'It states the benefit that makes a product attractive to customers.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-geas', 'ecele-geas-physics2', [
    ['Coulomb’s law gives the force between charges as proportional to:', ['q₁q₂ / r', 'q₁q₂ / r²', 'q₁ + q₂ / r²', 'r² / q₁q₂'], 1, 'F = k·q₁q₂ / r² — an inverse-square law.', 'easy'],
    ['Electric field intensity E at a point is defined as force per unit:', ['mass', 'charge', 'area', 'volume'], 1, 'E = F / q (force per unit positive test charge).', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-geas', 'ecele-geas-materials', [
    ['Steel is primarily an alloy of iron and:', ['carbon', 'copper', 'aluminium', 'silver'], 0, 'Steel is an iron-carbon alloy, often with additional alloying elements.', 'easy'],
    ['Compared with insulators, electrical conductors have:', ['higher resistivity', 'lower resistivity', 'the same resistivity', 'infinite resistivity'], 1, 'Conductors allow easy charge flow because of their low resistivity.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-geas', 'ecele-geas-programming', [
    ['A variable is best described as:', ['a named storage location for data', 'a type of loop', 'a compiler', 'a file extension'], 0, 'Variables hold values that a program can read and modify.', 'easy'],
    ['A loop in a program is used to:', ['repeat a block of instructions', 'store a single value', 'define a function only', 'end the program'], 0, 'Loops (for, while) repeat code until a condition changes.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-geas', 'ecele-geas-environment', [
    ['Biochemical oxygen demand (BOD) is a measure of:', ['organic pollution in water', 'air temperature', 'soil pH only', 'noise level'], 0, 'BOD indicates the amount of oxygen consumed by microorganisms decomposing organic matter.', 'medium'],
    ['The ozone layer primarily protects Earth’s surface from:', ['infrared radiation', 'ultraviolet radiation', 'radio waves', 'gamma rays'], 1, 'Stratospheric ozone absorbs most harmful UV radiation.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-geas', 'ecele-geas-law', [
    ['The foremost obligation of an engineer under a code of ethics is to:', ['maximize profit', 'hold paramount the safety, health and welfare of the public', 'follow client instructions blindly', 'minimize project time'], 1, 'Engineering codes of ethics place public safety, health and welfare above all else.', 'easy'],
    ['Before servicing electrical equipment, the safest first step is to:', ['remove only the fuse', 'disconnect and lock out/tag out the supply', 'wear thin gloves', 'increase the load'], 1, 'De-energising and locking out the circuit prevents accidental re-energisation.', 'easy'],
  ]),
  ...questionGroup('ecele', 'ecele-geas', 'ecele-geas-cad', [
    ['The difference between a schematic and a PCB layout is that a schematic:', ['shows logical connections, while layout defines physical placement and routing', 'shows only physical dimensions', 'is used only for documentation', 'cannot be simulated'], 0, 'A schematic captures connectivity; the layout defines component positions and copper tracks.', 'medium'],
    ['DRC in a PCB design tool stands for:', ['Design Rule Check', 'Dynamic Resistance Calibration', 'Digital Route Control', 'Data Review Cycle'], 0, 'DRC verifies that the design meets manufacturing and electrical rules.', 'easy'],
  ]),

  // ---------------------------------------------------------------- ECTLE
  ...questionGroup('ectle', 'ectle-technical', 'ectle-math-basic', [
    ['The binary number 1010 is equal to the decimal value:', ['8', '9', '10', '12'], 2, '1010₂ = 8 + 0 + 2 + 0 = 10.', 'easy'],
    ['The hexadecimal digit F represents the decimal value:', ['10', '14', '15', '16'], 2, 'Hex digits run 0–9 then A=10 through F=15.', 'easy'],
    ['What is 15% of 200?', ['15', '20', '30', '35'], 2, '0.15 × 200 = 30.', 'easy'],
  ]),
  ...questionGroup('ectle', 'ectle-technical', 'ectle-ohm-law', [
    ['A 12 V source is connected to a 4 Ω resistor. What is the current?', ['2 A', '3 A', '4 A', '48 A'], 1, 'By Ohm’s law, I = V / R = 12 / 4 = 3 A.', 'easy'],
    ['The power dissipated by a 2 Ω resistor carrying 3 A is:', ['6 W', '12 W', '18 W', '36 W'], 2, 'P = I²R = 3² × 2 = 18 W.', 'medium'],
    ['Two resistors of 4 Ω and 6 Ω in series have an equivalent resistance of:', ['2.4 Ω', '10 Ω', '5 Ω', '24 Ω'], 1, 'Series resistances add directly: 4 + 6 = 10 Ω.', 'easy'],
  ]),
  ...questionGroup('ectle', 'ectle-technical', 'ectle-machines', [
    ['A transformer is used to:', ['change AC voltage level', 'convert AC to DC', 'store electrical energy', 'amplify current only'], 0, 'A transformer changes AC voltage via electromagnetic induction.', 'easy'],
    ['The synchronous speed of an induction motor depends on:', ['supply frequency and number of poles', 'load torque only', 'armature resistance', 'ambient temperature'], 0, 'Ns = 120f / P, so speed depends on frequency and pole count.', 'medium'],
    ['A generator primarily converts:', ['mechanical energy to electrical energy', 'electrical energy to heat only', 'DC to AC only', 'sound to light'], 0, 'Generators convert mechanical rotation into electrical energy.', 'easy'],
  ]),
  ...questionGroup('ectle', 'ectle-technical', 'ectle-test-equipment', [
    ['An ammeter must be connected:', ['in parallel with the load', 'in series with the load', 'across the supply only', 'to ground only'], 1, 'An ammeter measures current and must be placed in series so the same current flows through it.', 'easy'],
    ['A good voltmeter has:', ['very low internal resistance', 'very high internal resistance', 'zero internal resistance', 'no internal resistance'], 1, 'High internal resistance minimises the current drawn from the circuit under test.', 'medium'],
    ['An oscilloscope primarily displays:', ['current versus temperature', 'voltage versus time', 'resistance versus frequency', 'power versus time'], 1, 'An oscilloscope plots instantaneous voltage against time.', 'easy'],
  ]),
  ...questionGroup('ectle', 'ectle-technical', 'ectle-components', [
    ['A resistor with colour bands brown–black–red has a resistance of:', ['100 Ω', '1 kΩ', '10 kΩ', '100 kΩ'], 1, 'Brown = 1, black = 0, red = ×100, giving 10 × 100 = 1,000 Ω = 1 kΩ.', 'medium'],
    ['Which component stores energy in an electric field?', ['Resistor', 'Capacitor', 'Inductor', 'Diode'], 1, 'A capacitor stores energy in the electric field between its plates.', 'easy'],
    ['A PN junction diode conducts when it is:', ['forward biased', 'reverse biased', 'unbiased', 'at breakdown always'], 0, 'Forward bias lowers the barrier potential and allows current to flow.', 'easy'],
  ]),
  ...questionGroup('ectle', 'ectle-technical', 'ectle-maintenance', [
    ['Before servicing electrical equipment, you should first:', ['remove the fuse only', 'disconnect and lock out the power supply', 'wear thin gloves', 'increase the load'], 1, 'Lockout/tagout and de-energising the circuit is the essential first safety step.', 'easy'],
    ['A fuse primarily protects a circuit against:', ['overvoltage', 'overcurrent', 'low frequency', 'reverse polarity'], 1, 'A fuse opens the circuit when current exceeds its rated value.', 'easy'],
    ['Before use, the tip of a soldering iron should be:', ['painted', 'tinned', 'sandblasted', 'oiled'], 1, 'Tinning the tip with solder improves heat transfer and prevents oxidation.', 'medium'],
  ]),
  ...questionGroup('ectle', 'ectle-technical', 'ectle-pec-electronics', [
    ['Grounding the shield of a signal cable primarily helps reduce:', ['electromagnetic interference', 'power consumption', 'cable capacitance', 'signal amplitude'], 0, 'A grounded shield drains induced noise and reduces EMI pickup.', 'medium'],
    ['Equipment enclosures are grounded mainly to protect against:', ['electric shock', 'voltage sag', 'radio interference', 'power factor penalty'], 0, 'Grounding gives fault current a low-resistance path so protective devices trip quickly.', 'medium'],
  ]),
  ...questionGroup('ectle', 'ectle-technical', 'ectle-pec-electrical', [
    ['The standard mains supply in the Philippines is approximately:', ['110 V, 50 Hz', '220 V, 60 Hz', '230 V, 50 Hz', '480 V, 60 Hz'], 1, 'Philippine mains power is nominally 220 V at 60 Hz.', 'easy'],
    ['Branch circuit conductors must be protected by:', ['an overcurrent protective device', 'a short length of wire', 'an open switch', 'a larger fuse than the load'], 0, 'Codes require overcurrent protection rated for the conductor ampacity.', 'medium'],
    ['A ground-fault circuit interrupter (GFCI) is designed to protect against:', ['electric shock from ground faults', 'overvoltage only', 'power factor penalties', 'frequency drift'], 0, 'A GFCI trips on small leakage currents to ground, reducing shock hazard.', 'medium'],
  ]),
  ...questionGroup('ectle', 'ectle-technical', 'ectle-ra9292', [
    ['Republic Act 9292 is known as the:', ['Electronics Engineering Law of 2004', 'Electrical Engineering Law of 2004', 'PRC Modernization Act', 'Consumer Protection Act'], 0, 'RA 9292 is the Electronics Engineering Law of 2004.', 'easy'],
    ['The practice of electronics engineering in the Philippines is regulated by the:', ['PRC', 'DTI', 'DOE', 'NTC'], 0, 'The Professional Regulation Commission licenses and regulates the profession.', 'easy'],
    ['Continuing professional development credits are generally required for:', ['licensure renewal', 'initial employment', 'graduation', 'internship'], 0, 'PRC requires CPD credits as a condition for renewal of professional licenses.', 'medium'],
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
  // ELECS
  ...flashcardGroup('ecele', 'ecele-elecs', 'ecele-elecs-dc', [
    ['Ohm’s law', 'V = I R'],
    ['Power in a resistor', 'P = I²R = V²/R'],
  ]),
  ...flashcardGroup('ecele', 'ecele-elecs', 'ecele-elecs-ac', [
    ['RMS of a sinusoid', 'Vp / √2'],
    ['At series resonance', 'XL = XC'],
  ]),
  ...flashcardGroup('ecele', 'ecele-elecs', 'ecele-elecs-emag', [
    ['Speed of light in free space', '≈ 3 × 10⁸ m/s'],
    ['Wave relationship', 'c = fλ'],
  ]),
  ...flashcardGroup('ecele', 'ecele-elecs', 'ecele-elecs-devices', [
    ['Forward drop of a silicon diode', '≈ 0.7 V'],
    ['BJT current gain β', 'Ic / Ib'],
  ]),
  ...flashcardGroup('ecele', 'ecele-elecs', 'ecele-elecs-circuit-design', [
    ['Inverting op-amp gain', '−Rf / Rin'],
    ['Thevenin equivalent', 'Vth in series with Rth'],
  ]),
  ...flashcardGroup('ecele', 'ecele-elecs', 'ecele-elecs-systems', [
    ['Diodes in a bridge rectifier', '4'],
    ['Purpose of a supply filter', 'Reduce ripple'],
  ]),
  ...flashcardGroup('ecele', 'ecele-elecs', 'ecele-elecs-logic', [
    ['NAND output is 0 when…', 'all inputs are 1'],
    ['Values representable with n bits', '2ⁿ'],
  ]),
  ...flashcardGroup('ecele', 'ecele-elecs', 'ecele-elecs-micro', [
    ['Microcontroller', 'CPU + memory + peripherals on one chip'],
    ['Interrupt', 'Temporarily suspends current task for an event'],
  ]),
  ...flashcardGroup('ecele', 'ecele-elecs', 'ecele-elecs-control', [
    ['Negative feedback', 'Lower gain, better stability'],
    ['Closed-loop transfer function', 'G / (1 + GH)'],
  ]),
  // EST
  ...flashcardGroup('ecele', 'ecele-est', 'ecele-est-signals', [
    ['Nyquist sampling criterion', 'fs ≥ 2fm'],
    ['Convolution in time equals…', 'Multiplication in frequency'],
  ]),
  ...flashcardGroup('ecele', 'ecele-est', 'ecele-est-principles', [
    ['AM modulation index', '(Emax − Emin)/(Emax + Emin)'],
    ['FM carrier amplitude', 'Constant'],
  ]),
  ...flashcardGroup('ecele', 'ecele-est', 'ecele-est-digital-comm', [
    ['BER of 10⁻⁶ means', '1 error per million bits'],
    ['Minimum binary baseband bandwidth', 'Rb / 2'],
  ]),
  ...flashcardGroup('ecele', 'ecele-est', 'ecele-est-transmission', [
    ['Characteristic impedance of a lossless line', 'Zo = √(L/C)'],
    ['VSWR for a perfect match', '1'],
  ]),
  ...flashcardGroup('ecele', 'ecele-est', 'ecele-est-systems', [
    ['Low-pass filter', 'Passes frequencies below cutoff'],
    ['Amplifier bandwidth', 'fH − fL'],
  ]),
  ...flashcardGroup('ecele', 'ecele-est', 'ecele-est-data', [
    ['Bits in an IPv4 address', '32'],
    ['Twisted-pair Ethernet connector', 'RJ45'],
  ]),
  ...flashcardGroup('ecele', 'ecele-est', 'ecele-est-cad', [
    ['CAD', 'Computer-Aided Design'],
    ['PCB fabrication artwork format', 'Gerber'],
  ]),
  // MATH
  ...flashcardGroup('ecele', 'ecele-math', 'ecele-math-diff', [
    ['Derivative of xⁿ', 'n·xⁿ⁻¹'],
    ['Derivative of sin x', 'cos x'],
  ]),
  ...flashcardGroup('ecele', 'ecele-math', 'ecele-math-int', [
    ['∫ xⁿ dx (n ≠ −1)', 'xⁿ⁺¹/(n+1) + C'],
    ['Definite integral of a positive function', 'Area under the curve'],
  ]),
  ...flashcardGroup('ecele', 'ecele-math', 'ecele-math-de', [
    ['Order of a DE', 'Highest derivative present'],
    ['Solution of dy/dx = ky', 'y = Ce^{kx}'],
  ]),
  ...flashcardGroup('ecele', 'ecele-math', 'ecele-math-advanced', [
    ['Laplace transform of e^{at}', '1/(s − a)'],
    ['Magnitude of a + bi', '√(a² + b²)'],
  ]),
  ...flashcardGroup('ecele', 'ecele-math', 'ecele-math-data', [
    ['Empirical rule (±1σ)', '≈ 68% of values'],
    ['Mean', 'Sum of values divided by count'],
  ]),
  ...flashcardGroup('ecele', 'ecele-math', 'ecele-math-emag', [
    ['Electric flux density', 'D = εE'],
    ['Maxwell’s equations', 'Unify electricity and magnetism'],
  ]),
  ...flashcardGroup('ecele', 'ecele-math', 'ecele-math-signals', [
    ['Unit impulse area', '1'],
    ['Fourier transform of a rectangular pulse', 'sinc function'],
  ]),
  ...flashcardGroup('ecele', 'ecele-math', 'ecele-math-control', [
    ['Stability requirement', 'All poles in the left half-plane'],
    ['Routh–Hurwitz', 'Stability from coefficients'],
  ]),
  // GEAS
  ...flashcardGroup('ecele', 'ecele-geas', 'ecele-geas-chem', [
    ['pH', '−log[H⁺]'],
    ['Avogadro’s number', '6.022 × 10²³'],
  ]),
  ...flashcardGroup('ecele', 'ecele-geas', 'ecele-geas-physics', [
    ['Newton’s second law', 'F = ma'],
    ['Kinetic energy', '½mv²'],
  ]),
  ...flashcardGroup('ecele', 'ecele-geas', 'ecele-geas-econ', [
    ['Simple interest', 'I = P r t'],
    ['Annuity', 'Equal payments at equal intervals'],
  ]),
  ...flashcardGroup('ecele', 'ecele-geas', 'ecele-geas-management', [
    ['PERT expected time', '(O + 4M + P) / 6'],
    ['Critical path', 'Longest path; sets project duration'],
  ]),
  ...flashcardGroup('ecele', 'ecele-geas', 'ecele-geas-techno', [
    ['Business model canvas', 'How value is created, delivered and captured'],
    ['Value proposition', 'Why customers choose your product'],
  ]),
  ...flashcardGroup('ecele', 'ecele-geas', 'ecele-geas-physics2', [
    ['Coulomb’s law', 'F = kq₁q₂ / r²'],
    ['Electric field intensity', 'E = F / q'],
  ]),
  ...flashcardGroup('ecele', 'ecele-geas', 'ecele-geas-materials', [
    ['Steel', 'Iron–carbon alloy'],
    ['Conductor resistivity', 'Low'],
  ]),
  ...flashcardGroup('ecele', 'ecele-geas', 'ecele-geas-programming', [
    ['Variable', 'Named storage location'],
    ['Loop', 'Repeats a block of code'],
  ]),
  ...flashcardGroup('ecele', 'ecele-geas', 'ecele-geas-environment', [
    ['BOD', 'Measure of organic pollution in water'],
    ['Ozone layer', 'Absorbs ultraviolet radiation'],
  ]),
  ...flashcardGroup('ecele', 'ecele-geas', 'ecele-geas-law', [
    ['Highest duty in engineering ethics', 'Public safety, health and welfare'],
    ['Before servicing equipment', 'De-energise and lock out/tag out'],
  ]),
  ...flashcardGroup('ecele', 'ecele-geas', 'ecele-geas-cad', [
    ['Schematic vs layout', 'Logical connections vs physical placement'],
    ['DRC', 'Design Rule Check'],
  ]),

  ...flashcardGroup('ectle', 'ectle-technical', 'ectle-math-basic', [
    ['1010₂ in decimal', '10'],
    ['Hexadecimal F', '15'],
  ]),
  ...flashcardGroup('ectle', 'ectle-technical', 'ectle-ohm-law', [
    ['Ohm’s law', 'V = I R'],
    ['Power in a resistor', 'P = I²R = V²/R'],
  ]),
  ...flashcardGroup('ectle', 'ectle-technical', 'ectle-machines', [
    ['Transformer function', 'Changes AC voltage level'],
    ['Synchronous speed formula', 'Ns = 120f / P'],
  ]),
  ...flashcardGroup('ectle', 'ectle-technical', 'ectle-test-equipment', [
    ['Ammeter connection', 'In series with the load'],
    ['Voltmeter input resistance', 'Very high'],
  ]),
  ...flashcardGroup('ectle', 'ectle-technical', 'ectle-components', [
    ['Resistor bands brown–black–red', '1 kΩ'],
    ['Diode conducts when…', 'Forward biased'],
  ]),
  ...flashcardGroup('ectle', 'ectle-technical', 'ectle-maintenance', [
    ['Before servicing equipment', 'De-energise and lock out/tag out'],
    ['Purpose of a fuse', 'Overcurrent protection'],
  ]),
  ...flashcardGroup('ectle', 'ectle-technical', 'ectle-pec-electronics', [
    ['Cable shield grounded to…', 'Reduce electromagnetic interference'],
    ['Equipment enclosure grounding', 'Shock protection'],
  ]),
  ...flashcardGroup('ectle', 'ectle-technical', 'ectle-pec-electrical', [
    ['Philippine mains supply', '220 V, 60 Hz'],
    ['GFCI', 'Ground-fault shock protection'],
  ]),
  ...flashcardGroup('ectle', 'ectle-technical', 'ectle-ra9292', [
    ['RA 9292', 'Electronics Engineering Law of 2004'],
    ['Regulates the profession', 'PRC'],
  ]),
]

export const seedCatalog: Catalog = {
  programs,
  subjects,
  topics,
  questions,
  flashcards,
}
