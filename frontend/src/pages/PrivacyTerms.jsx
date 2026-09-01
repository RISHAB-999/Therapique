import React, { useState, useEffect } from 'react'
import { Lock, ShieldCheck, User, CircleDollarSign } from 'lucide-react'
import { FaShieldHalved, FaLock, FaFileContract, FaCircleCheck, FaTriangleExclamation, FaHandshakeAngle, FaScaleBalanced, FaChevronDown, FaVideo } from 'react-icons/fa6'
import privacyIllustration from '../assets/privacy-security-illustration.png'
import { FadeUp, StaggerContainer, StaggerItem } from '../components/ScrollReveal'

const PrivacyTerms = () => {
    const [activeTab, setActiveTab] = useState('privacy')
    const [openSections, setOpenSections] = useState({
        section1: true,
        section2: true,
        section3: true,
        section4: true,
        terms1: true,
        terms2: true,
        terms3: true,
        terms4: true,
    })

    const toggleSection = (sectionKey) => {
        setOpenSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }))
    }

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [activeTab])

    return (
        <div className='max-padd-container py-6 sm:py-10 min-h-[85vh] overflow-hidden'>
            {/* ================= 2-COLUMN HERO SECTION ================= */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center pb-8 sm:pb-12'>
                {/* ---------- LEFT COLUMN (Headings, Badge & Paragraph) ---------- */}
                <FadeUp delay={0.1} className='lg:col-span-6 space-y-6 sm:space-y-8 text-left'>
                    {/* Top Group */}
                    <div className='space-y-3'>
                        <h1 className='font-therapique text-3xl sm:text-4xl md:text-5xl text-gray-900 tracking-tight leading-tight'>
                            <span className='font-bold'>Legal &</span>{' '}
                            <span className='font-normal underline decoration-gray-400 underline-offset-4'>Transparency</span>
                        </h1>

                        <p className='text-xs sm:text-sm text-gray-600 max-w-lg font-medium leading-relaxed'>
                            Discover books that spark curiosity, deliver quality and bring inspiration to your everyday reading
                        </p>

                        <div className='pt-1'>
                            <span className='text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#6B46C1] bg-[#EDE7FA] px-3.5 py-1 rounded-full inline-block'>
                                TRUST & PATIENT CONFIDENTIALITY
                            </span>
                        </div>
                    </div>

                    {/* Bottom Group */}
                    <div className='space-y-2.5 pt-2 sm:pt-4'>
                        <h2 className='font-therapique text-xl sm:text-2xl md:text-[28px] font-bold text-gray-900 tracking-tight leading-snug'>
                            Your Privacy and Peace of Mind Come First.
                        </h2>
                        <p className='text-xs sm:text-sm text-gray-600 leading-relaxed font-medium max-w-lg'>
                            At Therapique, mental health care is built on absolute confidentiality, clinical ethics, and transparent practices. Review our policies below to understand how your data, appointments, and consultations are protected.
                        </p>
                    </div>
                </FadeUp>

                {/* ---------- RIGHT COLUMN (Illustration on Top + Clean Cross Grid Below) ---------- */}
                <FadeUp delay={0.2} className='lg:col-span-6 flex flex-col items-center justify-center'>
                    {/* Illustration Shifted Slightly Left and Up with Jump-Out 3D Hover */}
                    <div className='w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px] flexCenter mx-auto -translate-x-2 sm:-translate-x-4 -mb-1 sm:-mb-3 group relative z-10'>
                        <img
                            src={privacyIllustration}
                            alt="Privacy & Security Illustration"
                            className='w-full h-auto object-contain cursor-pointer transition-all duration-500 ease-out drop-shadow-[0_10px_20px_rgba(107,70,193,0.12)] group-hover:drop-shadow-[0_25px_35px_rgba(107,70,193,0.35)] group-hover:-translate-y-3 group-hover:scale-[1.04] active:scale-95'
                        />
                    </div>

                    {/* Clean 2x2 Inner Cross Grid Centered */}
                    <div className='w-full max-w-lg mx-auto'>
                        <div className='grid grid-cols-2'>
                            {/* Item 1: Top-Left */}
                            <div className='p-3 sm:p-4 pr-4 pb-4 border-r border-b border-[#EADBCE] flex items-center gap-3 sm:gap-3.5'>
                                <Lock className='w-5 h-5 sm:w-6 sm:h-6 text-purple-600 shrink-0 stroke-[1.8]' />
                                <div className='min-w-0'>
                                    <h4 className='text-xs sm:text-sm font-extrabold text-gray-900 leading-tight truncate'>
                                        Encrypted Calls
                                    </h4>
                                    <p className='text-[10px] sm:text-[11px] text-gray-500 font-medium mt-0.5 truncate'>
                                        WebRTC E2EE
                                    </p>
                                </div>
                            </div>

                            {/* Item 2: Top-Right */}
                            <div className='p-3 sm:p-4 pl-4 pb-4 border-b border-[#EADBCE] flex items-center gap-3 sm:gap-3.5'>
                                <ShieldCheck className='w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0 stroke-[1.8]' />
                                <div className='min-w-0'>
                                    <h4 className='text-xs sm:text-sm font-extrabold text-gray-900 leading-tight truncate'>
                                        HIPAA Aligned
                                    </h4>
                                    <p className='text-[10px] sm:text-[11px] text-gray-500 font-medium mt-0.5 truncate'>
                                        Confidentiality
                                    </p>
                                </div>
                            </div>

                            {/* Item 3: Bottom-Left */}
                            <div className='p-3 sm:p-4 pr-4 pt-4 border-r border-[#EADBCE] flex items-center gap-3 sm:gap-3.5'>
                                <User className='w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0 stroke-[1.8]' />
                                <div className='min-w-0'>
                                    <h4 className='text-xs sm:text-sm font-extrabold text-gray-900 leading-tight truncate'>
                                        No Data Sharing
                                    </h4>
                                    <p className='text-[10px] sm:text-[11px] text-gray-500 font-medium mt-0.5 truncate'>
                                        Zero Third Parties
                                    </p>
                                </div>
                            </div>

                            {/* Item 4: Bottom-Right */}
                            <div className='p-3 sm:p-4 pl-4 pt-4 flex items-center gap-3 sm:gap-3.5'>
                                <CircleDollarSign className='w-5 h-5 sm:w-6 sm:h-6 text-amber-600 shrink-0 stroke-[1.8]' />
                                <div className='min-w-0'>
                                    <h4 className='text-xs sm:text-sm font-extrabold text-gray-900 leading-tight truncate'>
                                        Fair Refunds
                                    </h4>
                                    <p className='text-[10px] sm:text-[11px] text-gray-500 font-medium mt-0.5 truncate'>
                                        Transparent Coins
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeUp>
            </div>

            {/* ================= TAB SWITCHER BUTTONS (With Top, Middle & Bottom Separator Lines) ================= */}
            <FadeUp delay={0.1} className='border-t border-b border-[#EADBCE] py-4 sm:py-5 my-6 sm:my-8 flex items-center gap-3 sm:gap-4'>
                <button
                    onClick={() => setActiveTab('privacy')}
                    className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-extrabold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${activeTab === 'privacy'
                            ? 'bg-black text-white shadow-md'
                            : 'text-gray-700 hover:bg-[#EDE7FA]/50'
                        }`}
                >
                    <FaShieldHalved className={activeTab === 'privacy' ? 'text-white' : 'text-purple-700'} />
                    <span>Privacy Policy</span>
                </button>

                {/* Vertical Divider Line Between Tabs */}
                <div className='h-6 w-px bg-[#EADBCE]' />

                <button
                    onClick={() => setActiveTab('terms')}
                    className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-extrabold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${activeTab === 'terms'
                            ? 'bg-black text-white shadow-md'
                            : 'text-purple-900 hover:bg-[#EDE7FA]/50'
                        }`}
                >
                    <FaFileContract className={activeTab === 'terms' ? 'text-white' : 'text-purple-700'} />
                    <span>Terms of Service</span>
                </button>
            </FadeUp>

            {/* ================= PRIVACY POLICY ACCORDION CARDS (STAGGERED) ================= */}
            {activeTab === 'privacy' && (
                <StaggerContainer staggerDelay={0.08} className='space-y-4 text-gray-700 text-xs sm:text-sm leading-relaxed'>
                    {/* Section 1 */}
                    <StaggerItem className='bg-[#FAF5EE] p-4 sm:p-6 rounded-3xl border border-[#EADBCE] shadow-[0_4px_20px_rgba(70,56,48,0.02)] transition-all'>
                        <div
                            onClick={() => toggleSection('section1')}
                            className='flex items-center justify-between gap-3 cursor-pointer'
                        >
                            <div className='flex items-center gap-3 sm:gap-4 text-gray-900'>
                                <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-600 text-white flexCenter shrink-0 shadow-xs'>
                                    <FaLock className='text-xs sm:text-sm' />
                                </div>
                                <h3 className='text-xs sm:text-base font-extrabold text-left leading-snug'>
                                    1. Commitment to Patient Privacy & Data Protection
                                </h3>
                            </div>
                            <FaChevronDown className={`text-xs text-gray-500 transition-transform duration-300 shrink-0 ${openSections.section1 ? 'rotate-180' : ''}`} />
                        </div>

                        {openSections.section1 && (
                            <div className='pt-3 sm:pt-4 pl-0 sm:pl-14 space-y-2 text-gray-600 text-xs sm:text-sm'>
                                <p>
                                    Therapique is committed to maintaining the highest ethical standards of patient privacy, in full compliance with international psychological telemedicine benchmarks and health data privacy principles. Any personal, demographic, or clinical information shared on this platform is stored securely using industry-standard 256-bit encryption.
                                </p>
                                <p>
                                    We collect only the essential information needed to personalize your mental health journey: your name, contact email, date of birth, emergency contact details, and appointment scheduling preferences.
                                </p>
                            </div>
                        )}
                    </StaggerItem>

                    {/* Section 2 */}
                    <StaggerItem className='bg-[#FAF5EE] p-4 sm:p-6 rounded-3xl border border-[#EADBCE] shadow-[0_4px_20px_rgba(70,56,48,0.02)] transition-all'>
                        <div
                            onClick={() => toggleSection('section2')}
                            className='flex items-center justify-between gap-3 cursor-pointer'
                        >
                            <div className='flex items-center gap-3 sm:gap-4 text-gray-900'>
                                <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-teal-500 text-white flexCenter shrink-0 shadow-xs'>
                                    <FaVideo className='text-xs sm:text-sm' />
                                </div>
                                <h3 className='text-xs sm:text-base font-extrabold text-left leading-snug'>
                                    2. WebRTC Video Consultations & Session Confidentiality
                                </h3>
                            </div>
                            <FaChevronDown className={`text-xs text-gray-500 transition-transform duration-300 shrink-0 ${openSections.section2 ? 'rotate-180' : ''}`} />
                        </div>

                        {openSections.section2 && (
                            <div className='pt-3 sm:pt-4 pl-0 sm:pl-14 space-y-2.5 text-gray-600 text-xs sm:text-sm'>
                                <p>
                                    All video consultations between patients and licensed therapists are conducted via secure, real-time peer-to-peer WebRTC connections.
                                </p>
                                <ul className='space-y-2 pt-1 text-gray-800 font-medium'>
                                    <li className='flex items-start gap-2'>
                                        <FaCircleCheck className='text-emerald-600 text-xs mt-1 shrink-0' />
                                        <span><strong>Zero Call Recording:</strong> Live consultation streams are never recorded, tapped, or stored on our servers.</span>
                                    </li>
                                    <li className='flex items-start gap-2'>
                                        <FaCircleCheck className='text-emerald-600 text-xs mt-1 shrink-0' />
                                        <span><strong>Privileged Communications:</strong> Everything discussed during your consultation remains strictly between you and your licensed therapist under professional doctor-patient confidentiality.</span>
                                    </li>
                                    <li className='flex items-start gap-2'>
                                        <FaCircleCheck className='text-emerald-600 text-xs mt-1 shrink-0' />
                                        <span><strong>Clinical Notes Protection:</strong> Any personal therapy notes kept by your doctor are guarded behind encrypted clinical partitions.</span>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </StaggerItem>

                    {/* Section 3 */}
                    <StaggerItem className='bg-[#FAF5EE] p-4 sm:p-6 rounded-3xl border border-[#EADBCE] shadow-[0_4px_20px_rgba(70,56,48,0.02)] transition-all'>
                        <div
                            onClick={() => toggleSection('section3')}
                            className='flex items-center justify-between gap-3 cursor-pointer'
                        >
                            <div className='flex items-center gap-3 sm:gap-4 text-gray-900'>
                                <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 text-white flexCenter shrink-0 shadow-xs'>
                                    <FaShieldHalved className='text-xs sm:text-sm' />
                                </div>
                                <h3 className='text-xs sm:text-base font-extrabold text-left leading-snug'>
                                    3. Payment & Token Security
                                </h3>
                            </div>
                            <FaChevronDown className={`text-xs text-gray-500 transition-transform duration-300 shrink-0 ${openSections.section3 ? 'rotate-180' : ''}`} />
                        </div>

                        {openSections.section3 && (
                            <div className='pt-3 sm:pt-4 pl-0 sm:pl-14 space-y-2 text-gray-600 text-xs sm:text-sm'>
                                <p>
                                    Financial transactions for consultations, token packs, and books are processed via PCI-DSS certified payment gateways (RazorPay / UPI / Stripe). Therapique does not store your credit card numbers, CVVs, or banking passwords.
                                </p>
                                <p>
                                    Your Therapique Coin balance and wallet transactions are permanently recorded in an immutable ledger tied exclusively to your registered account ID.
                                </p>
                            </div>
                        )}
                    </StaggerItem>

                    {/* Section 4 */}
                    <StaggerItem className='bg-[#FAF5EE] p-4 sm:p-6 rounded-3xl border border-[#EADBCE] shadow-[0_4px_20px_rgba(70,56,48,0.02)] transition-all'>
                        <div
                            onClick={() => toggleSection('section4')}
                            className='flex items-center justify-between gap-3 cursor-pointer'
                        >
                            <div className='flex items-center gap-3 sm:gap-4 text-gray-900'>
                                <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500 text-white flexCenter shrink-0 shadow-xs'>
                                    <FaTriangleExclamation className='text-xs sm:text-sm' />
                                </div>
                                <h3 className='text-xs sm:text-base font-extrabold text-left leading-snug'>
                                    4. Exceptions to Confidentiality (Duty of Care)
                                </h3>
                            </div>
                            <FaChevronDown className={`text-xs text-gray-500 transition-transform duration-300 shrink-0 ${openSections.section4 ? 'rotate-180' : ''}`} />
                        </div>

                        {openSections.section4 && (
                            <div className='pt-3 sm:pt-4 pl-0 sm:pl-14 space-y-2 text-gray-600 text-xs sm:text-sm'>
                                <p>
                                    In accordance with standard psychological licensing laws, confidentiality may only be broken in rare, life-threatening emergency situations where there is an imminent, severe risk of harm to yourself or others, or under legally binding court subpoenas.
                                </p>
                            </div>
                        )}
                    </StaggerItem>
                </StaggerContainer>
            )}

            {/* ================= TERMS OF SERVICE ACCORDION CARDS (STAGGERED) ================= */}
            {activeTab === 'terms' && (
                <StaggerContainer staggerDelay={0.08} className='space-y-4 text-gray-700 text-xs sm:text-sm leading-relaxed'>
                    {/* Terms 1 */}
                    <StaggerItem className='bg-[#FAF5EE] p-4 sm:p-6 rounded-3xl border border-[#EADBCE] shadow-[0_4px_20px_rgba(70,56,48,0.02)] transition-all'>
                        <div
                            onClick={() => toggleSection('terms1')}
                            className='flex items-center justify-between gap-3 cursor-pointer'
                        >
                            <div className='flex items-center gap-3 sm:gap-4 text-gray-900'>
                                <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-600 text-white flexCenter shrink-0 shadow-xs'>
                                    <FaHandshakeAngle className='text-xs sm:text-sm' />
                                </div>
                                <h3 className='text-xs sm:text-base font-extrabold text-left leading-snug'>
                                    1. Consultation Booking & Code of Conduct
                                </h3>
                            </div>
                            <FaChevronDown className={`text-xs text-gray-500 transition-transform duration-300 shrink-0 ${openSections.terms1 ? 'rotate-180' : ''}`} />
                        </div>

                        {openSections.terms1 && (
                            <div className='pt-3 sm:pt-4 pl-0 sm:pl-14 space-y-2 text-gray-600 text-xs sm:text-sm'>
                                <p>
                                    By booking a consultation through Therapique, you agree to attend sessions punctually, maintain mutual respect with healthcare providers, and provide accurate medical and personal background information.
                                </p>
                                <p>
                                    Therapists on Therapique are independent, licensed mental health professionals. Therapique provides the technology platform, appointment logistics, and communication tooling to facilitate care.
                                </p>
                            </div>
                        )}
                    </StaggerItem>

                    {/* Terms 2 */}
                    <StaggerItem className='bg-[#FAF5EE] p-4 sm:p-6 rounded-3xl border border-[#EADBCE] shadow-[0_4px_20px_rgba(70,56,48,0.02)] transition-all'>
                        <div
                            onClick={() => toggleSection('terms2')}
                            className='flex items-center justify-between gap-3 cursor-pointer'
                        >
                            <div className='flex items-center gap-3 sm:gap-4 text-gray-900'>
                                <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-600 text-white flexCenter shrink-0 shadow-xs'>
                                    <FaScaleBalanced className='text-xs sm:text-sm' />
                                </div>
                                <h3 className='text-xs sm:text-base font-extrabold text-left leading-snug'>
                                    2. Cancellation, Rescheduling & Refund Policy
                                </h3>
                            </div>
                            <FaChevronDown className={`text-xs text-gray-500 transition-transform duration-300 shrink-0 ${openSections.terms2 ? 'rotate-180' : ''}`} />
                        </div>

                        {openSections.terms2 && (
                            <div className='pt-3 sm:pt-4 pl-0 sm:pl-14 space-y-2.5 text-gray-600 text-xs sm:text-sm'>
                                <ul className='space-y-2 text-gray-800 font-medium'>
                                    <li className='flex items-start gap-2'>
                                        <FaCircleCheck className='text-emerald-600 text-xs mt-1 shrink-0' />
                                        <span><strong>Early Cancellations (24h+ notice):</strong> Appointments cancelled at least 24 hours prior to the scheduled time will receive a 100% refund or full token reimbursement back to your account wallet.</span>
                                    </li>
                                    <li className='flex items-start gap-2'>
                                        <FaCircleCheck className='text-emerald-600 text-xs mt-1 shrink-0' />
                                        <span><strong>Doctor Cancellations:</strong> If a therapist needs to reschedule or cancel due to unforeseen medical emergencies, you will be offered an immediate alternative slot or full refund.</span>
                                    </li>
                                    <li className='flex items-start gap-2'>
                                        <FaCircleCheck className='text-emerald-600 text-xs mt-1 shrink-0' />
                                        <span><strong>Book Orders:</strong> Tangible book purchases can be tracked under "My Orders". Defective or damaged copies are eligible for free replacement within 7 days of delivery.</span>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </StaggerItem>

                    {/* Terms 3 */}
                    <StaggerItem className='bg-[#FAF5EE] p-4 sm:p-6 rounded-3xl border border-[#EADBCE] shadow-[0_4px_20px_rgba(70,56,48,0.02)] transition-all'>
                        <div
                            onClick={() => toggleSection('terms3')}
                            className='flex items-center justify-between gap-3 cursor-pointer'
                        >
                            <div className='flex items-center gap-3 sm:gap-4 text-rose-600'>
                                <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-600 text-white flexCenter shrink-0 shadow-xs'>
                                    <FaTriangleExclamation className='text-xs sm:text-sm' />
                                </div>
                                <h3 className='text-xs sm:text-base font-extrabold text-gray-900 text-left leading-snug'>
                                    3. Emergency & Crisis Disclaimer
                                </h3>
                            </div>
                            <FaChevronDown className={`text-xs text-gray-500 transition-transform duration-300 shrink-0 ${openSections.terms3 ? 'rotate-180' : ''}`} />
                        </div>

                        {openSections.terms3 && (
                            <div className='pt-3 sm:pt-4 pl-0 sm:pl-14 space-y-2 text-gray-600 text-xs sm:text-sm'>
                                <div className='p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5'>
                                    <p className='font-bold text-xs sm:text-sm'>
                                        🚨 Therapique is not an emergency psychiatric triage service.
                                    </p>
                                    <p className='text-xs leading-relaxed'>
                                        If you or someone you know is experiencing suicidal thoughts, self-harm impulses, or severe psychiatric distress, please immediately contact your local emergency services (dial <strong>112</strong> / <strong>911</strong>) or call the national mental health crisis helpline at <strong className='underline'>1800-599-0019</strong>.
                                    </p>
                                </div>
                            </div>
                        )}
                    </StaggerItem>
                </StaggerContainer>
            )}

            {/* ================= LEGAL CONTACT SUPPORT BOX ================= */}
            <FadeUp delay={0.2} className='mt-10 p-5 sm:p-6 rounded-3xl bg-[#FAF5EE] border border-[#EADBCE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                <div>
                    <h4 className='font-extrabold text-gray-900 text-xs sm:text-base'>Have Questions or Legal Inquiries?</h4>
                    <p className='text-xs text-gray-600 mt-0.5 font-medium'>Our dedicated compliance and data protection officer is available to assist you.</p>
                </div>
                <a
                    href='mailto:privacy@therapique.com'
                    className='bg-black hover:bg-gray-800 text-white font-extrabold py-2.5 sm:py-3 px-5 sm:px-6 rounded-full text-xs sm:text-sm transition cursor-pointer shadow-sm shrink-0'
                >
                    Contact Legal Support →
                </a>
            </FadeUp>
        </div>
    )
}

export default PrivacyTerms
