
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const totalSteps = 6;

    useEffect(() => {
        fetchApi('/api/profile')
            .then((data) => {
                console.log("OnboardingPage profile check:", data);
                if (data && data.onboardingCompleted) {
                    router.push('/dashboard');
                } else {
                    setCheckingStatus(false);
                    // If we have partial data, maybe pre-fill?
                    if (data) {
                        setFormData(prev => ({
                            ...prev,
                            ...data,
                            // Ensure arrays are initialized
                            education: data.education || [],
                            experience: data.experience || [],
                            sexualOrientation: data.sexualOrientation || [],
                        }));
                    }
                }
            })
            .catch((err) => {
                console.error("Failed to check profile status", err);
                setCheckingStatus(false);
            });
    }, [router]);

    const [formData, setFormData] = useState({
        // Personal
        firstName: '',
        lastName: '',
        middleName: '',
        phone: '',
        phoneCountryCode: '',
        phoneDeviceType: '',
        phoneExtension: '',
        location: '',
        linkedin: '',
        github: '',
        portfolio: '',

        // Address
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        country: '',

        // Education (Array)
        education: [] as any[],

        // Experience (Array)
        experience: [] as any[],

        // Skills & Resume
        skills: '', // comma separated for now

        // Job Prefs
        desiredSalary: '',
        noticePeriod: '',

        // Demographics
        workAuth: '',
        disability: '',
        gender: '',
        sponsorship: '',
        lgbtq: '',
        veteran: '',
        race: '',
        hispanic: '',
        sexualOrientation: [] as string[],
    });

    // Helper for array field state
    const [newEdu, setNewEdu] = useState({ school: '', degree: '', startDate: '', endDate: '' });
    const [newExp, setNewExp] = useState({ company: '', role: '', startDate: '', endDate: '', description: '', current: false });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (setter: any, field: string, value: any) => {
        setter((prev: any) => ({ ...prev, [field]: value }));
    };

    const addEducation = () => {
        setFormData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
        setNewEdu({ school: '', degree: '', startDate: '', endDate: '' });
    };

    const addExperience = () => {
        setFormData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
        setNewExp({ company: '', role: '', startDate: '', endDate: '', description: '', current: false });
    };

    const handleOrientationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            if (checked) return { ...prev, sexualOrientation: [...prev.sexualOrientation, value] };
            return { ...prev, sexualOrientation: prev.sexualOrientation.filter(o => o !== value) };
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Create a payload copy to avoid mutating state directly
            const payload = { ...formData };

            // Auto-save pending education if valid
            if (newEdu.school.trim() || newEdu.degree.trim()) {
                payload.education = [...payload.education, newEdu];
            }

            // Auto-save pending experience if valid
            if (newExp.company.trim() || newExp.role.trim()) {
                payload.experience = [...payload.experience, newExp];
            }

            console.log("Submitting Onboarding Data:", payload);

            await fetchApi('/api/onboarding', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            alert("Submission failed");
            setLoading(false);
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                {checkingStatus ? (
                    <div className="flex justify-center mt-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Complete Your Profile
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Step {step} of {totalSteps}
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                        </div>
                    </>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
                {!checkingStatus && (
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

                        {/* STEP 1: Personal */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                                        <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700">Country Code</label>
                                            <input type="text" name="phoneCountryCode" placeholder="+1" value={formData.phoneCountryCode} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Device Type</label>
                                        <select name="phoneDeviceType" value={formData.phoneDeviceType} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white">
                                            <option value="">Select...</option>
                                            <option value="Mobile">Mobile</option>
                                            <option value="Home">Home</option>
                                            <option value="Work">Work</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Extension</label>
                                        <input type="text" name="phoneExtension" value={formData.phoneExtension} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                                        <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">GitHub URL</label>
                                        <input type="text" name="github" value={formData.github} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Portfolio URL</label>
                                        <input type="text" name="portfolio" value={formData.portfolio} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Address */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Address Details</h3>
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                                        <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
                                        <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">City</label>
                                        <input type="text" name="city" value={formData.city} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">State/Province</label>
                                        <input type="text" name="state" value={formData.state} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Zip/Postal Code</label>
                                        <input type="text" name="zip" value={formData.zip} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Country</label>
                                        <input type="text" name="country" value={formData.country} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Location (Summary, e.g. "New York, NY")</label>
                                        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Displayed on your profile" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Education */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Education</h3>

                                {formData.education.map((edu, idx) => (
                                    <div key={idx} className="bg-gray-50 p-4 rounded-md relative group">
                                        <button type="button" onClick={() => setFormData(p => ({ ...p, education: p.education.filter((_, i) => i !== idx) }))} className="absolute top-2 right-2 text-red-500 text-sm hidden group-hover:block">Remove</button>
                                        <p className="font-semibold">{edu.school}</p>
                                        <p className="text-sm">{edu.degree} ({edu.startDate} - {edu.endDate})</p>
                                    </div>
                                ))}

                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Add Education</h4>
                                    <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                        <input placeholder="School Name" value={newEdu.school} onChange={e => handleArrayChange(setNewEdu, 'school', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                        <input placeholder="Degree" value={newEdu.degree} onChange={e => handleArrayChange(setNewEdu, 'degree', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                        <input placeholder="Start Date" type="date" value={newEdu.startDate} onChange={e => handleArrayChange(setNewEdu, 'startDate', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                        <input placeholder="End Date" type="date" value={newEdu.endDate} onChange={e => handleArrayChange(setNewEdu, 'endDate', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                    </div>
                                    <button type="button" onClick={addEducation} className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                                        Add Education
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Experience */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Work Experience</h3>

                                {formData.experience.map((exp, idx) => (
                                    <div key={idx} className="bg-gray-50 p-4 rounded-md relative group">
                                        <button type="button" onClick={() => setFormData(p => ({ ...p, experience: p.experience.filter((_, i) => i !== idx) }))} className="absolute top-2 right-2 text-red-500 text-sm hidden group-hover:block">Remove</button>
                                        <p className="font-semibold">{exp.role} at {exp.company}</p>
                                        <p className="text-sm">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                                        <p className="text-xs text-gray-500 mt-1">{exp.description}</p>
                                    </div>
                                ))}

                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Add Experience</h4>
                                    <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                        <input placeholder="Company Name" value={newExp.company} onChange={e => handleArrayChange(setNewExp, 'company', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                        <input placeholder="Role" value={newExp.role} onChange={e => handleArrayChange(setNewExp, 'role', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                        <div className="flex items-center space-x-2 sm:col-span-2">
                                            <input type="checkbox" checked={newExp.current} onChange={e => handleArrayChange(setNewExp, 'current', e.target.checked)} id="current-work" />
                                            <label htmlFor="current-work" className="text-sm text-gray-700">Currently Working Here</label>
                                        </div>
                                        <input placeholder="Start Date" type="date" value={newExp.startDate} onChange={e => handleArrayChange(setNewExp, 'startDate', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                        <input placeholder="End Date" type="date" disabled={newExp.current} value={newExp.endDate} onChange={e => handleArrayChange(setNewExp, 'endDate', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-100 text-black bg-white disabled:text-gray-500" />
                                        <textarea placeholder="Job Description" rows={3} value={newExp.description} onChange={e => handleArrayChange(setNewExp, 'description', e.target.value)} className="sm:col-span-2 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                    </div>
                                    <button type="button" onClick={addExperience} className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                                        Add Experience
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 5: Skills & Resume */}
                        {step === 5 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Skills & Resume</h3>

                                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2">Upload Resume (PDF)</h4>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            const formData = new FormData();
                                            formData.append("file", file);

                                            setLoading(true);
                                            try {
                                                const res = await fetch('/api/resume/parse', { // We kept the route name "parse" but it only uploads now
                                                    method: 'POST',
                                                    body: formData,
                                                });
                                                if (res.ok) {
                                                    alert("Resume uploaded successfully!");
                                                } else {
                                                    alert("Failed to upload resume.");
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                alert("Failed to upload resume.");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                    />
                                    <p className="text-xs text-blue-600 mt-1">Upload your resume PDF to store it in your profile.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                                    <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" placeholder="e.g. React, Node.js, Python" />
                                </div>
                            </div>
                        )}

                        {/* STEP 6: Demographics & Job Prefs */}
                        {step === 6 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Demographics & Preferences</h3>

                                <div className="grid grid-cols-1 gap-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Desired Salary (USD)</label>
                                            <input type="text" name="desiredSalary" value={formData.desiredSalary} onChange={handleChange} placeholder="e.g. 100000" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Notice Period</label>
                                            <input type="text" name="noticePeriod" value={formData.noticePeriod} onChange={handleChange} placeholder="e.g. 2 weeks" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900" />
                                        </div>
                                    </div>

                                    <div>
                                        <span className="block text-sm font-medium text-gray-700 mb-1">Are you authorized to work in the US?</span>
                                        <select name="workAuth" value={formData.workAuth} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900">
                                            <option value="">Select...</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                    </div>

                                    <div>
                                        <span className="block text-sm font-medium text-gray-700 mb-1">Will you now or in the future require sponsorship?</span>
                                        <select name="sponsorship" value={formData.sponsorship} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900">
                                            <option value="">Select...</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                    </div>

                                    <div>
                                        <span className="block text-sm font-medium text-gray-700 mb-1">Do you have a disability?</span>
                                        <select name="disability" value={formData.disability} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900">
                                            <option value="">Select...</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </div>

                                    <div>
                                        <span className="block text-sm font-medium text-gray-700 mb-1">Are you a veteran?</span>
                                        <select name="veteran" value={formData.veteran} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900">
                                            <option value="">Select...</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                    </div>

                                    <div>
                                        <span className="block text-sm font-medium text-gray-700 mb-1">Do you identify as LGBTQ+?</span>
                                        <select name="lgbtq" value={formData.lgbtq} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900">
                                            <option value="">Select...</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </div>

                                    <div>
                                        <span className="block text-sm font-medium text-gray-700 mb-1">What is your gender?</span>
                                        <select name="gender" value={formData.gender} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900">
                                            <option value="">Select...</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Non-binary">Non-binary</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </div>

                                    <div>
                                        <span className="block text-sm font-medium text-gray-700 mb-1">How would you identify your race?</span>
                                        <select name="race" value={formData.race} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900">
                                            <option value="">Select...</option>
                                            <option value="Asian">Asian</option>
                                            <option value="Black or African American">Black or African American</option>
                                            <option value="Hispanic or Latino">Hispanic or Latino</option>
                                            <option value="White">White</option>
                                            <option value="Native American">Native American</option>
                                            <option value="Pacific Islander">Pacific Islander</option>
                                            <option value="Two or More Races">Two or More Races</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </div>

                                    <div>
                                        <span className="block text-sm font-medium text-gray-700 mb-1">Are you Hispanic or Latino?</span>
                                        <select name="hispanic" value={formData.hispanic} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900">
                                            <option value="">Select...</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                    </div>

                                    <div>
                                        <span className="block text-sm font-medium text-gray-700 mb-1">Sexual Orientation (Mark all that apply)</span>
                                        <div className="space-y-2">
                                            {['Heterosexual', 'Gay', 'Lesbian', 'Bisexual', 'Prefer not to say'].map(opt => (
                                                <div key={opt} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`so-${opt}`}
                                                        value={opt}
                                                        checked={formData.sexualOrientation.includes(opt)}
                                                        onChange={handleOrientationChange}
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor={`so-${opt}`} className="ml-2 block text-sm text-gray-900">
                                                        {opt}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-8 flex justify-between">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Back
                                </button>
                            ) : <div></div>}

                            {step < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
                                >
                                    {loading ? 'Submitting...' : 'Complete Profile'}
                                </button>
                            )}

                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
