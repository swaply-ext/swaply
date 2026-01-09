export interface SkillsModel {
    id: string;
    name: string;
    icon: string;
    category: string;
}

export interface SkillDisplay extends SkillsModel {
    level: number;
}

export interface UserSkills {
    id: string;
    level: number;
}

export interface Interest {
    id?: string;
    name: string;
    selected?: boolean;
    image?: string;
    level?: number;
}
