const TherapistProfile = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">

        {/* Credentials */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6">
          <h2 className="text-xl font-serif mb-3">Credentials</h2>
          <p className="text-gray-700">
            Master of Science in Couple and Family Therapy, University of Guelph – 2021
          </p>
          <p className="text-gray-700 mt-1">
            Honours Bachelor of Science in Biology with a Double Major in Biology and Psychology,
            University of Toronto – 2017
          </p>
        </div>

        {/* Modalities */}
        <div className="bg-white shadow-sm rounded-2xl p-6">
          <h2 className="text-xl font-serif mb-3">Modalities</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Emotion-Focused Therapy (EFT)</li>
            <li>Systemic Therapy / Family Systems</li>
            <li>Attachment-Based Therapy</li>
            <li>Narrative Therapy</li>
            <li>Cognitive Behavioural Therapy (CBT)</li>
            <li>Solution-Focused Therapy (SFT)</li>
          </ul>
        </div>

        {/* Areas of Focus */}
        <div className="bg-white shadow-sm rounded-2xl p-6">
          <h2 className="text-xl font-serif mb-3">Areas of Focus</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Anxiety & stress disorders</li>
            <li>Depression & mood-related concerns</li>
            <li>Relationship issues (including romantic, familial, and interpersonal)</li>
            <li>Communication & attachment difficulties</li>
            <li>Family conflict & parenting challenges</li>
            <li>Adolescent emotional well-being</li>
            <li>Self-esteem & identity concerns</li>
            <li>Relationship with self & self-compassion</li>
            <li>Life transitions & adjustment challenges</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


export default TherapistProfile;