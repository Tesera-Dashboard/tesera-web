"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const team = [
  {
    name: "Yusuf Atas",
    title: "CEO & DevOps Engineer",
    image: "/yusuf-atas.png",
    linkedin: "https://linkedin.com/in/yusuf-atas34",
    github: "https://github.com/yusufatass",
  },
  {
    name: "Ulas Can Demirbag",
    title: "CTO & Fullstack Engineer",
    image: "/ulas-can-demirbag.png",
    linkedin: "https://www.linkedin.com/in/ulascandemirbag/",
    github: "https://github.com/ulascan54",
  },
  {
    name: "Sedef Esra Kazan",
    title: "CBD & İş Geliştirme ve Marketing",
    image: "/sedef-esra-kazan.png",
    linkedin: "https://www.linkedin.com/in/sedef-kazan-a90400332/",
    github: "https://github.com/sedefkazan",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export function Team() {
  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background" id="team">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ekibimiz
          </h2>
          <p className="text-lg text-muted-foreground">
            Tesera'yı inşa eden insanlar
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {team.map((member, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.2 }
              }}
              className="group flex flex-col items-center text-center"
            >
              <div className="relative w-48 h-48 mb-6 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{member.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{member.title}</p>
              <div className="flex gap-3">
                <Link
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-muted text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  LinkedIn
                </Link>
                <Link
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-muted text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  GitHub
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
