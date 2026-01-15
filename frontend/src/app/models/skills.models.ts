export interface SkillsModel {
    id: string;
    name: string;
    icon: string;
    category: string;
}

export interface SkillDisplay extends SkillsModel {
    level?: number;
    selected?: boolean;
    image?: string;

}

export interface UserSkills {
    id: string;
    level: number;
}
