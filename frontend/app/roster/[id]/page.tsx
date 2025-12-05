
'use client';

import {use} from "react";

// Function to generate all static slugs at build time
// export async function generateStaticParams() {
//   // Replace this with your actual data fetching logic (API call, database query, etc.)
//   // This runs during the 'next build' process.
//   const posts = await fetch('https://api.example.com/rosters').then((res) => res.json());

//   // Return an array of objects, where each object matches the dynamic segment name
//   return posts.map((post: { id: string; title: string; }) => ({
//     slug: post.id, // The 'slug' property name must match the folder name '[slug]'
//   }));

//   // Example of hardcoded values for testing:
//   // return [{ slug: 'john-doe' }, { slug: 'jane-smith' }];
// }


export default function RosterPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
  return (
    <h1 className="text-orange-500">Roster ID: {id}</h1>
);
}

