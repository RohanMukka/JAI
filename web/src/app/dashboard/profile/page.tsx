
'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddEdu, setShowAddEdu] = useState(false);
    const [showAddExp, setShowAddExp] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        middleName: '', // New
        education: [] as any[],
        experience: [] as any[],
        skills: '',

        workAuth: '',
        disability: '',
        gender: '',
        sponsorship: '',
        lgbtq: '',
        veteran: '',
        race: '',
        hispanic: '',
        sexualOrientation: [] as string[],

        linkedin: '',
        github: '',
        portfolio: '',
        phone: '',
        phoneCountryCode: '', // New
        phoneDeviceType: '', // New
        phoneExtension: '', // New
        location: '',

        // Address
        addressLine1: '', // New
        addressLine2: '', // New
        city: '', // New
        state: '', // New
        zip: '', // New
        country: '', // New

        // Job Prefs
        desiredSalary: '', // New
        noticePeriod: '', // New
    });

    // Helper for array field state
    const [newEdu, setNewEdu] = useState({ school: '', degree: '', startDate: '', endDate: '' });
    const [newExp, setNewExp] = useState({ company: '', role: '', startDate: '', endDate: '', description: '', current: false });

    useEffect(() => {
        fetchApi('/api/profile')
            .then((data) => {
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
            })
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...formData };
            // Auto-save pending education if valid
            if (newEdu.school.trim() || newEdu.degree.trim()) {
                payload.education = [...payload.education, newEdu];
            }
            // Auto-save pending experience if valid
            if (newExp.company.trim() || newExp.role.trim()) {
                payload.experience = [...payload.experience, newExp];
            }

            await fetchApi('/api/profile', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            alert('Profile saved!');
        } catch (error) {
            console.error(error);
            alert('Failed to save profile.');
        } finally {
            setSaving(false);
        }
    };

    const calculateCompletion = () => {
        const fields = [
            { id: 'firstName', label: 'First Name', value: formData.firstName },
            { id: 'lastName', label: 'Last Name', value: formData.lastName },
            { id: 'phone', label: 'Phone Number', value: formData.phone },
            { id: 'linkedin', label: 'LinkedIn URL', value: formData.linkedin },
            { id: 'github', label: 'GitHub URL', value: formData.github },
            { id: 'location', label: 'Profile Location', value: formData.location },
            { id: 'addressLine1', label: 'Address Line 1', value: formData.addressLine1 },
            { id: 'city', label: 'City', value: formData.city },
            { id: 'state', label: 'State', value: formData.state },
            { id: 'zip', label: 'Zip Code', value: formData.zip },
            { id: 'country', label: 'Country', value: formData.country },
            { id: 'desiredSalary', label: 'Desired Salary', value: formData.desiredSalary },
            { id: 'noticePeriod', label: 'Notice Period', value: formData.noticePeriod },
            { id: 'workAuth', label: 'Work Authorization', value: formData.workAuth },
            { id: 'gender', label: 'Gender', value: formData.gender },
            { id: 'race', label: 'Race', value: formData.race },
            { id: 'skills', label: 'Skills', value: formData.skills },
        ];

        const missing = fields.filter(f => !f.value || f.value.toString().trim() === '');
        const arrayMissing = [];
        if (formData.education.length === 0) arrayMissing.push('Education');
        if (formData.experience.length === 0) arrayMissing.push('Work Experience');
        if (formData.sexualOrientation.length === 0) arrayMissing.push('Sexual Orientation');

        const totalPoints = fields.length + 3;
        const completedPoints = (fields.length - missing.length) + (3 - arrayMissing.length);
        const percentage = Math.round((completedPoints / totalPoints) * 100);

        return { percentage, missing: [...missing.map(m => m.label), ...arrayMissing] };
    };

    if (loading) return <div className="p-8">Loading profile...</div>;

    const { percentage, missing } = calculateCompletion();

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">Profile Completion:</span>
                    <span className={`text-sm font-bold ${percentage === 100 ? 'text-green-600' : 'text-indigo-600'}`}>{percentage}%</span>
                </div>
            </div>

            {/* Completion Bar */}
            <div className="bg-white p-6 rounded-lg shadow mb-8 border-l-4 border-indigo-500">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Completion Progress</h2>
                    {percentage === 100 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✨ 100% Complete!
                        </span>
                    )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                    <div
                        className="bg-indigo-600 h-4 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>

                {percentage < 100 && (
                    <div>
                        <p className="text-sm text-gray-600 mb-2 font-medium">Complete these fields to reach 100%:</p>
                        <div className="flex flex-wrap gap-2">
                            {missing.slice(0, 8).map((label, idx) => (
                                <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                    {label}
                                </span>
                            ))}
                            {missing.length > 8 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                                    + {missing.length - 8} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow">

                {/* Personal Info */}
                <section>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Personal Details</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                            <input type="text" name="middleName" value={formData.middleName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Country Code</label>
                                <input type="text" name="phoneCountryCode" placeholder="+1" value={formData.phoneCountryCode || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Device Type</label>
                            <select name="phoneDeviceType" value={formData.phoneDeviceType || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white">
                                <option value="">Select...</option>
                                <option value="Mobile">Mobile</option>
                                <option value="Home">Home</option>
                                <option value="Work">Work</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Extension</label>
                            <input type="text" name="phoneExtension" value={formData.phoneExtension || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                        </div>
                    </div>

                    {/* Job Preferences */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Desired Salary (USD)</label>
                            <input type="text" name="desiredSalary" value={formData.desiredSalary || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Notice Period (Days/Weeks)</label>
                            <input type="text" name="noticePeriod" value={formData.noticePeriod || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                            <input type="text" name="addressLine1" value={formData.addressLine1 || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
                            <input type="text" name="addressLine2" value={formData.addressLine2 || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">City</label>
                            <input type="text" name="city" value={formData.city || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">State/Province</label>
                            <input type="text" name="state" value={formData.state || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Zip/Postal Code</label>
                            <input type="text" name="zip" value={formData.zip || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Country</label>
                            <input type="text" name="country" value={formData.country || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                        </div>
                    </div>
                    {/* Kept 'Location' as a display/summary field if needed, or legacy */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Location (Summary, e.g. "New York, NY")</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                            <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">GitHub</label>
                            <input type="text" name="github" value={formData.github} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Portfolio</label>
                            <input type="text" name="portfolio" value={formData.portfolio} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white" />
                        </div>
                    </div>
                </section>

                {/* Education */}
                <section>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Education</h3>
                    {formData.education.map((edu, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-md relative group mb-2 border border-gray-200">
                            <button type="button" onClick={() => setFormData(p => ({ ...p, education: p.education.filter((_, i) => i !== idx) }))} className="absolute top-2 right-2 text-red-500 text-sm hidden group-hover:block">Remove</button>
                            <p className="font-semibold text-black">{edu.school}</p>
                            <p className="text-sm text-black">{edu.degree} ({edu.startDate} - {edu.endDate})</p>
                        </div>
                    ))}

                    {!showAddEdu ? (
                        <button type="button" onClick={() => setShowAddEdu(true)} className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            + Add Education
                        </button>
                    ) : (
                        <div className="border border-gray-200 p-4 rounded-md mt-2 bg-gray-50">
                            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                <input placeholder="School Name" value={newEdu.school} onChange={e => handleArrayChange(setNewEdu, 'school', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                <input placeholder="Degree" value={newEdu.degree} onChange={e => handleArrayChange(setNewEdu, 'degree', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                <input placeholder="Start Date" type="date" value={newEdu.startDate} onChange={e => handleArrayChange(setNewEdu, 'startDate', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                <input placeholder="End Date" type="date" value={newEdu.endDate} onChange={e => handleArrayChange(setNewEdu, 'endDate', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                            </div>
                            <div className="mt-4 flex space-x-2">
                                <button type="button" onClick={() => { addEducation(); setShowAddEdu(false); }} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200">Save Education</button>
                                <button type="button" onClick={() => setShowAddEdu(false)} className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Experience */}
                <section>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Work Experience</h3>
                    {formData.experience.map((exp, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-md relative group mb-2 border border-gray-200">
                            <button type="button" onClick={() => setFormData(p => ({ ...p, experience: p.experience.filter((_, i) => i !== idx) }))} className="absolute top-2 right-2 text-red-500 text-sm hidden group-hover:block">Remove</button>
                            <p className="font-semibold text-black">{exp.role} at {exp.company}</p>
                            <p className="text-sm text-black">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                            <p className="text-xs text-black mt-1">{exp.description}</p>
                        </div>
                    ))}

                    {!showAddExp ? (
                        <button type="button" onClick={() => setShowAddExp(true)} className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            + Add Experience
                        </button>
                    ) : (
                        <div className="border border-gray-200 p-4 rounded-md mt-2 bg-gray-50">
                            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                <input placeholder="Company Name" value={newExp.company} onChange={e => handleArrayChange(setNewExp, 'company', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                <input placeholder="Role" value={newExp.role} onChange={e => handleArrayChange(setNewExp, 'role', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                <div className="flex items-center space-x-2 sm:col-span-2">
                                    <input type="checkbox" checked={newExp.current} onChange={e => handleArrayChange(setNewExp, 'current', e.target.checked)} id="current-work-prof" />
                                    <label htmlFor="current-work-prof" className="text-sm text-black">Currently Working Here</label>
                                </div>
                                <input placeholder="Start Date" type="date" value={newExp.startDate} onChange={e => handleArrayChange(setNewExp, 'startDate', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                                <input placeholder="End Date" type="date" disabled={newExp.current} value={newExp.endDate} onChange={e => handleArrayChange(setNewExp, 'endDate', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-100 text-black bg-white disabled:text-gray-500" />
                                <textarea placeholder="Job Description" rows={3} value={newExp.description} onChange={e => handleArrayChange(setNewExp, 'description', e.target.value)} className="sm:col-span-2 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                            </div>
                            <div className="mt-4 flex space-x-2">
                                <button type="button" onClick={() => { addExperience(); setShowAddExp(false); }} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200">Save Experience</button>
                                <button type="button" onClick={() => setShowAddExp(false)} className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Skills & Resume */}
                <section>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Skills & Resume</h3>

                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-6">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Resume PDF</h4>

                        {/* PDF Viewer */}
                        <div className="mb-4 bg-white p-2 rounded border border-gray-300">
                            <iframe
                                src="/api/resume/view"
                                className="w-full h-96 rounded"
                                title="Resume PDF"
                            />
                        </div>

                        <h4 className="text-sm font-medium text-blue-800 mb-2 mt-4">Update Resume</h4>
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
                                    const res = await fetch('/api/resume/parse', { method: 'POST', body: formData });
                                    if (res.ok) {
                                        alert("Resume uploaded successfully! Refresh to see the new PDF.");
                                        // Optionally trigger a re-fetch or iframe reload here
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
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Skills</label>
                        <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white" />
                    </div>
                </section>

                {/* Demographics */}
                <section>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Demographics</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-1">Work Auth</span>
                            <select name="workAuth" value={formData.workAuth} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white">
                                <option value="">Select...</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-1">Sponsorship</span>
                            <select name="sponsorship" value={formData.sponsorship} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white">
                                <option value="">Select...</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-1">Disability</span>
                            <select name="disability" value={formData.disability} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white">
                                <option value="">Select...</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-1">Veteran</span>
                            <select name="veteran" value={formData.veteran} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white">
                                <option value="">Select...</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-1">Gender</span>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white">
                                <option value="">Select...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Non-binary">Non-binary</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-1">LGBTQ+</span>
                            <select name="lgbtq" value={formData.lgbtq} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white">
                                <option value="">Select...</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-1">Race</span>
                            <select name="race" value={formData.race} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white">
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
                            <span className="block text-sm font-medium text-gray-700 mb-1">Hispanic/Latino</span>
                            <select name="hispanic" value={formData.hispanic} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-white">
                                <option value="">Select...</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="block text-sm font-medium text-gray-700 mb-1">Sexual Orientation</span>
                        <div className="space-y-2">
                            {['Heterosexual', 'Gay', 'Lesbian', 'Bisexual', 'Prefer not to say'].map(opt => (
                                <div key={opt} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`so-prof-${opt}`}
                                        value={opt}
                                        checked={formData.sexualOrientation ? formData.sexualOrientation.includes(opt) : false}
                                        onChange={handleOrientationChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor={`so-prof-${opt}`} className="ml-2 block text-sm text-gray-900">
                                        {opt}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="flex justify-end pt-4 border-t">
                    <button
                        type="submit"
                        disabled={saving}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                    >
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
}
