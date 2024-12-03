import React from 'react';
import { motion } from 'framer-motion';
import { Code, Database, Terminal, GitBranch } from 'lucide-react';
import Badge from '../ui/Badge';

interface Skill {
  name: string;
  level: number;
  icon: React.FC;
  color: string;
  subskills: Array<{
    name: string;
    progress: number;
  }>;
}

const SkillTree: React.FC = () => {
  const skills: Skill[] = [
    {
      name: 'Core Python',
      level: 3,
      icon: Code,
      color: 'text-blue-500',
      subskills: [
        { name: 'Data Types', progress: 90 },
        { name: 'Control Flow', progress: 85 },
        { name: 'Functions', progress: 75 },
      ],
    },
    {
      name: 'Data Structures',
      level: 2,
      icon: Database,
      color: 'text-purple-500',
      subskills: [
        { name: 'Lists & Tuples', progress: 80 },
        { name: 'Dictionaries', progress: 70 },
        { name: 'Sets', progress: 65 },
      ],
    },
    {
      name: 'Advanced Concepts',
      level: 1,
      icon: Terminal,
      color: 'text-pink-500',
      subskills: [
        { name: 'Decorators', progress: 40 },
        { name: 'Generators', progress: 30 },
        { name: 'Context Managers', progress: 25 },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {skills.map((skill, index) => (
        <motion.div
          key={skill.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/10 
                   backdrop-blur-lg border border-white/20 p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-lg bg-${skill.color.split('-')[1]}-500/20`}>
              <skill.icon className={skill.color} />
            </div>
            <div>
              <h3 className="text-lg font-semibold gradient-text">{skill.name}</h3>
              <div className="flex gap-2 mt-1">
                {Array.from({ length: skill.level }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (index * 0.1) + (i * 0.1) }}
                    className={`w-2 h-2 rounded-full bg-${skill.color.split('-')[1]}-500`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {skill.subskills.map((subskill, subIndex) => (
              <div key={subskill.name} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{subskill.name}</span>
                  <Badge 
                    text={`${subskill.progress}%`}
                    variant={
                      subskill.progress >= 80 ? 'success' :
                      subskill.progress >= 60 ? 'warning' : 'error'
                    }
                  />
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${subskill.progress}%` }}
                    transition={{ delay: (index * 0.1) + (subIndex * 0.1) }}
                    className={`h-full bg-${skill.color.split('-')[1]}-500`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SkillTree;