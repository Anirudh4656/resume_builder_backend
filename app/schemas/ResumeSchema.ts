import mongoose, { Schema, Document, Model } from 'mongoose';

export interface Education {
    university: string;
    degree: string;
    startDate: string;
    endDate: string;
    gpa: string;
}

export interface Experience {
    title: string;
    organisation: string;
    startDate: string;
    endDate: string;
    description: string[];
}

export interface Skill {
    skillName: string;
    keywords: string[];
}

export interface Project {
    projectName: string;
    keywords: string[];
    projectDescription: string[];
    projectLink: string;
}

export interface Achievement {
    title: string;
    date?: string;
    organisation?: string;
    description: string[];
}

export interface Personal {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    website?: string;
}

export interface Resume extends Document {
    title: string;
    template?: string;
    personal: Personal;
    education: Education[];
    experience: Experience[];
    skills: Skill[];
    projects: Project[];
    achievements: Achievement[];
    createdBy: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const educationSchema: Schema<Education> = new Schema({
    university: { type: String, required: true, minlength: 3, maxlength: 100 },
    degree: { type: String, required: true, minlength: 2, maxlength: 100 },
    startDate: { type: String, required: true, minlength: 3, maxlength: 50 },
    endDate: { type: String, required: true, minlength: 3, maxlength: 50 },
    gpa: { type: String, required: true, minlength: 1, maxlength: 5 },
});

const experienceSchema: Schema<Experience> = new Schema({
    title: { type: String, minlength: 3, maxlength: 100 },
    organisation: { type: String, minlength: 3, maxlength: 100 },
    startDate: { type: String, minlength: 3, maxlength: 50 },
    endDate: { type: String, minlength: 3, maxlength: 50 },
    description: [{ type: String, minlength: 3, maxlength: 100 }],
});

const skillSchema: Schema<Skill> = new Schema({
    skillName: { type: String, minlength: 3, maxlength: 255 },
    keywords: [{ type: String, minlength: 3, maxlength: 50 }],
});

const projectSchema: Schema<Project> = new Schema({
    projectName: { type: String, required: true, minlength: 3, maxlength: 100 },
    keywords: [{ type: String, minlength: 2, maxlength: 50 }],
    projectDescription: [{ type: String, minlength: 3, maxlength: 500 }],
    projectLink: { type: String, minlength: 3, maxlength: 255 },
});

const achievementSchema: Schema<Achievement> = new Schema({
    title: { type: String, required: true, minlength: 2, maxlength: 100 },
    date: { type: String },
    organisation: { type: String, minlength: 1, maxlength: 100 },
    description: [{ type: String, maxlength: 100 }],
});

const personalSchema: Schema<Personal> = new Schema({
    firstName: { type: String, required: true, minlength: 2, maxlength: 100 },
    lastName: { type: String, required: true, minlength: 2, maxlength: 100 },
    phone: { type: String, required: true, minlength: 6, maxlength: 50 },
    email: { type: String, required: true, minlength: 3, maxlength: 255 },
    website: { type: String, minlength: 3, maxlength: 255 },
});

const resumeSchema: Schema<Resume> = new Schema({
    title: { type: String, required: true, unique: true, minlength: 3, maxlength: 50 },
    template: { type: String },
    personal: { type: personalSchema, required: true },
    education: { type: [educationSchema], required: true },
    experience: { type: [experienceSchema], required: true },
    skills: { type: [skillSchema], required: true },
    projects: { type: [projectSchema], required: true },
    achievements: { type: [achievementSchema], required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
}, { timestamps: true });

const Resume: Model<Resume> = mongoose.model<Resume>('Resume', resumeSchema);

export default Resume;
