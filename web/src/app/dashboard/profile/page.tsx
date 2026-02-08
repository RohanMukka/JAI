
'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        education: [] as any[],
        experience: [] as any[],
        skills: '', // comma separated string or array? Let's treat as string for input
        resumeText: '',
        workAuth: '',
        disability: '',
        gender: '',
        sponsorship: '',
        lgbtq: '',
        veteran: '',
        race: '',
        hispanic: '',
        sexualOrientation: [] as string[],

        // Legacy fields map to new ones or kept?
        // Let's keep new ones.
        linkedin: '',
        github: '',
        portfolio: '',
        phone: '',
        location: '',
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
            await fetchApi('/api/profile', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            alert('Profile saved!');
        } catch (error) {
            console.error(error);
            alert('Failed to save profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading profile...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow">

                {/* Personal Info */}
                <section>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Personal Details</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Location</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                            <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">GitHub</label>
                            <input type="text" name="github" value={formData.github} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Portfolio</label>
                            <input type="text" name="portfolio" value={formData.portfolio} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                    </div>
                </section>

                {/* Education */}
                <section>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Education</h3>
                    {formData.education.map((edu, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-md relative group mb-2">
                            <button type="button" onClick={() => setFormData(p => ({ ...p, education: p.education.filter((_, i) => i !== idx) }))} className="absolute top-2 right-2 text-red-500 text-sm hidden group-hover:block">Remove</button>
                            <p className="font-semibold">{edu.school}</p>
                            <p className="text-sm">{edu.degree} ({edu.startDate} - {edu.endDate})</p>
                        </div>
                    ))}
                    <div className="border-t border-gray-200 pt-4 mt-2">
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                            <input placeholder="School Name" value={newEdu.school} onChange={e => handleArrayChange(setNewEdu, 'school', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                            <input placeholder="Degree" value={newEdu.degree} onChange={e => handleArrayChange(setNewEdu, 'degree', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                            <input placeholder="Start Date" type="date" value={newEdu.startDate} onChange={e => handleArrayChange(setNewEdu, 'startDate', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                            <input placeholder="End Date" type="date" value={newEdu.endDate} onChange={e => handleArrayChange(setNewEdu, 'endDate', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <button type="button" onClick={addEducation} className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200">Add Education</button>
                    </div>
                </section>

                {/* Experience */}
                <section>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Work Experience</h3>
                    {formData.experience.map((exp, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-md relative group mb-2">
                            <button type="button" onClick={() => setFormData(p => ({ ...p, experience: p.experience.filter((_, i) => i !== idx) }))} className="absolute top-2 right-2 text-red-500 text-sm hidden group-hover:block">Remove</button>
                            <p className="font-semibold">{exp.role} at {exp.company}</p>
                            <p className="text-sm">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                            <p className="text-xs text-gray-500 mt-1">{exp.description}</p>
                        </div>
                    ))}
                    <div className="border-t border-gray-200 pt-4 mt-2">
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                            <input placeholder="Company Name" value={newExp.company} onChange={e => handleArrayChange(setNewExp, 'company', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                            <input placeholder="Role" value={newExp.role} onChange={e => handleArrayChange(setNewExp, 'role', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                            <div className="flex items-center space-x-2 sm:col-span-2">
                                <input type="checkbox" checked={newExp.current} onChange={e => handleArrayChange(setNewExp, 'current', e.target.checked)} id="current-work-prof" />
                                <label htmlFor="current-work-prof" className="text-sm text-gray-700">Currently Working Here</label>
                            </div>
                            <input placeholder="Start Date" type="date" value={newExp.startDate} onChange={e => handleArrayChange(setNewExp, 'startDate', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                            <input placeholder="End Date" type="date" disabled={newExp.current} value={newExp.endDate} onChange={e => handleArrayChange(setNewExp, 'endDate', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-100" />
                            <textarea placeholder="Job Description" rows={3} value={newExp.description} onChange={e => handleArrayChange(setNewExp, 'description', e.target.value)} className="sm:col-span-2 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <button type="button" onClick={addExperience} className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200">Add Experience</button>
                    </div>
                </section>

                {/* Skills & Resume */}
                <section>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Skills & Resume</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Skills</label>
                        <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Resume Text</label>
                        <textarea name="resumeText" rows={10} value={formData.resumeText} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                </section>

                {/* Demographics */}
                <section>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Demographics</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-1">Work Auth</span>
                            <select name="workAuth" value={formData.workAuth} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                <option value="">Select...</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-1">Sponsorship</span>
                            <select name="sponsorship" value={formData.sponsorship} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                <option value="">Select...</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-1">Disability</span>
                            <select name="disability" value={formData.disability} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                <option value="">Select...</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-1">Veteran</span>
                            <select name="veteran" value={formData.veteran} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                <option value="">Select...</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-1">Gender</span>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                <option value="">Select...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Non-binary">Non-binary</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-1">LGBTQ+</span>
                            <select name="lgbtq" value={formData.lgbtq} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                <option value="">Select...</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-1">Race</span>
                            <select name="race" value={formData.race} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2">
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
                            <select name="hispanic" value={formData.hispanic} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-2">
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
