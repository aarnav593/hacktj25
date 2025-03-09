import React from "react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <h1 className="text-4xl font-bold text-center mb-6 text-red-500">About BioBlitz</h1>
        <div className="text-lg text-black">
        <p>
          Welcome to BioBlitz! This is a fun and engaging platform where you can enhance
          your biology and medical knowledge through competitive quizzes and interactive
          challenges. Our goal is to provide an engaging learning platform for students in biomed.
        </p> <br/>

        <h2 className="text-3xl text-center  font-semibold mt-auto text-red-500">Our Mission</h2>
        <p className="mt-2">
          At BioBlitz, we aim to provide a platform where students can not only
          learn but also challenge themselves in the realm of biology. We believe
          that learning through competition is an exciting and effective way to
          stay motivated, while reinforcing important biological concepts.
        </p> <br/>

        <h2 className="text-3xl text-center font-semibold mt-auto text-red-500">Our Story</h2>
        <p className="mt-2">
          BioBlitz was created during HackTJ 2025, as part of an effort to make
          learning biology more interactive and fun. The project began with the
          vision of turning traditional studying methods into a dynamic, game-like
          experience that motivates learners to improve while having fun. With
          this platform, we hope to foster a community of curious minds eager to
          explore the wonders of life sciences.
        </p> <br/> 

        <h2 className="text-3xl text-center font-semibold mt-auto text-red-500">Join Us!</h2>
        <p className="mt-2">
          Whether you're a student looking to prepare for biology competitions, a
          teacher looking for an engaging educational tool, or simply someone who
          enjoys learning about the natural world, BioBlitz is the place for you.
          Join our community today and start your journey toward mastering biology!
        </p> 
      </div>
    </div>
  );
};