export interface Deity {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly image: string;
}

export interface LyricLine {
  readonly time: number; // in seconds
  readonly text: string;
}

export interface Aarti {
  readonly id: string;
  readonly deityId: string;
  readonly title: string;
  readonly subtitle: string;
  readonly category: string;
  readonly duration: string; // e.g., "4:20"
  readonly durationSeconds: number; // e.g., 260
  readonly audioUrl: string;
  readonly videoId: string; // YouTube video ID
  readonly lyrics: readonly LyricLine[];
}

export interface Wallpaper {
  readonly id: string;
  readonly deityId?: string;
  readonly title: string;
  readonly imageUrl: string;
}

export interface Reminder {
  readonly id: string;
  readonly title: string;
  readonly time: string; // e.g., "06:00 AM"
  readonly isEnabled: boolean;
}

export const DEITIES: readonly Deity[] = [
  {
    id: 'deity_ganesha',
    name: 'Ganesha',
    description: 'Remover of Obstacles',
    image: 'https://images.unsplash.com/photo-1566378246598-5b11a0d486cc?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'deity_shiva',
    name: 'Shiva',
    description: 'The Transformer',
    image: 'https://images.unsplash.com/photo-1609137144813-2d5804e4c222?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'deity_krishna',
    name: 'Krishna',
    description: 'The Eternal Guide',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'deity_durga',
    name: 'Durga',
    description: 'Divine Mother',
    image: 'https://images.unsplash.com/photo-1632832961726-c2ba31f50a80?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'deity_hanuman',
    name: 'Hanuman',
    description: 'Symbol of Devotion',
    image: 'https://images.unsplash.com/photo-1615818499660-30bb56f6e7c7?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'deity_lakshmi',
    name: 'Lakshmi',
    description: 'Bringer of Prosperity',
    image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=400&auto=format&fit=crop&q=80',
  },
];

export const AARTIS: readonly Aarti[] = [
  {
    id: 'aarti_ganesha',
    deityId: 'deity_ganesha',
    title: 'Shree Ganesh Aarti',
    subtitle: 'Sukh Karta Dukh Harta',
    category: 'Popular',
    duration: '4:20',
    durationSeconds: 260,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Dev audio fallback
    videoId: 'y25k2S9n_4Y', // Sukh Karta Dukh Harta popular video
    lyrics: [
      { time: 0, text: "Sukhkarta Dukhharta Varta Vighnachi" },
      { time: 6, text: "Nurvi Purvi Prem Krupa Jayachi" },
      { time: 12, text: "Sarvangi Sundar Uti Shendurachi" },
      { time: 18, text: "Kanthi Jhalke Maal Muktaphalaanchi" },
      { time: 24, text: "Jai Dev Jai Dev, Jai Mangal Murti" },
      { time: 30, text: "Darshan Maatre Man Kaamana Purti" },
      { time: 36, text: "Jai Dev Jai Dev" },
      { time: 42, text: "Ratnakhachit Phara Tujh Gauri Kumara" },
      { time: 48, text: "Chandanachi Uti Kumkum Keshara" },
      { time: 54, text: "Heera Jadit Mukut Shobhato Bara" },
      { time: 60, text: "Runjhunati Nupure Charani Ghagariya" },
      { time: 66, text: "Jai Dev Jai Dev, Jai Mangal Murti" }
    ]
  },
  {
    id: 'aarti_hanuman',
    deityId: 'deity_hanuman',
    title: 'Hanuman Chalisa',
    subtitle: 'Full Recital',
    category: 'Morning',
    duration: '9:15',
    durationSeconds: 555,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    videoId: 'AETFvQonfV8', // Gulshan Kumar/Hariharan version
    lyrics: [
      { time: 0, text: "Shree Guru Charan Saroj Raj, Nija Manu Mukuru Sudhari" },
      { time: 8, text: "Barnau Raghuvar Bimal Jasu, Jo Dayaku Phala Chari" },
      { time: 16, text: "Budhi Heen Tanu Janike, Sumirau Pavan Kumar" },
      { time: 24, text: "Bal Budhi Vidya Dehu Mohi, Harahu Kalesh Bikaar" },
      { time: 32, text: "Jai Hanuman Gyan Gun Sagar" },
      { time: 37, text: "Jai Kapis Tihun Lok Ujagar" },
      { time: 42, text: "Ram Doot Atulit Bal Dhama" },
      { time: 47, text: "Anjani Putra Pavan Sut Nama" },
      { time: 52, text: "Mahaveer Vikram Bajrangi" },
      { time: 57, text: "Kumati Nivar Sumati Ke Sangi" }
    ]
  },
  {
    id: 'aarti_lakshmi',
    deityId: 'deity_lakshmi',
    title: 'Lakshmi Mata Aarti',
    subtitle: 'Evening Prayer',
    category: 'Evening',
    duration: '5:45',
    durationSeconds: 345,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    videoId: 'qD-pQW5fEik', // Om Jai Lakshmi Mata
    lyrics: [
      { time: 0, text: "Om Jai Lakshmi Mata, Maiya Jai Lakshmi Mata" },
      { time: 8, text: "Tumko Nishdin Dhyavat, Hari Vishnu Vidhata" },
      { time: 16, text: "Uma Rama Brahmani, Tum Hi Jag Mata" },
      { time: 24, text: "Surya Chandrama Dhyavat, Naarad Rishi Gata" },
      { time: 32, text: "Om Jai Lakshmi Mata" },
      { time: 40, text: "Durga Roop Niranjani, Sukh Sampatti Data" },
      { time: 48, text: "Jo Koi Tumko Dhyata, Riddhi Siddhi Dhan Pata" }
    ]
  },
  {
    id: 'aarti_shiva',
    deityId: 'deity_shiva',
    title: 'Shiv Aarti',
    subtitle: 'Om Jai Shiv Omkara',
    category: 'Evening',
    duration: '6:12',
    durationSeconds: 372,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    videoId: '1_KjOve6m-4',
    lyrics: [
      { time: 0, text: "Om Jai Shiv Omkara, Swami Jai Shiv Omkara" },
      { time: 8, text: "Brahma Vishnu Sadashiv, Ardhangi Dhara" },
      { time: 16, text: "Ekanan Chaturanan Panchanan Raje" },
      { time: 24, text: "Hansaasan Garudaasan Vrishvaahan Saje" },
      { time: 32, text: "Om Jai Shiv Omkara" }
    ]
  },
  {
    id: 'aarti_vishnu',
    deityId: 'deity_krishna', // Map to Krishna / Vishnu
    title: 'Om Jai Jagdish Hare',
    subtitle: 'Vishnu Aarti',
    category: 'Popular',
    duration: '5:24',
    durationSeconds: 324,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    videoId: 'v1Vp44cWj2E',
    lyrics: [
      { time: 0, text: "Om Jai Jagdish Hare, Swami Jai Jagdish Hare" },
      { time: 8, text: "Bhakt Janon Ke Sankat, Kshan Mein Door Kare" },
      { time: 16, text: "Jo Dhyave Phal Pave, Dukh Binse Man Ka" },
      { time: 24, text: "Sukh Sampati Ghar Aave, Kasht Mite Tan Ka" },
      { time: 32, text: "Om Jai Jagdish Hare" }
    ]
  }
];

export const WALLPAPERS: readonly Wallpaper[] = [
  {
    id: 'wp_krishna',
    deityId: 'deity_krishna',
    title: 'Lord Krishna Flute',
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'wp_shiva',
    deityId: 'deity_shiva',
    title: 'Lord Shiva Meditating',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-2d5804e4c222?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'wp_ganesha',
    deityId: 'deity_ganesha',
    title: 'Lotus Lord Ganesha',
    imageUrl: 'https://images.unsplash.com/photo-1566378246598-5b11a0d486cc?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'wp_durga',
    deityId: 'deity_durga',
    title: 'Maa Durga Blessing',
    imageUrl: 'https://images.unsplash.com/photo-1632832961726-c2ba31f50a80?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'wp_hanuman',
    deityId: 'deity_hanuman',
    title: 'Hanuman Devotion',
    imageUrl: 'https://images.unsplash.com/photo-1615818499660-30bb56f6e7c7?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'wp_mandala',
    title: 'Sacred Mandala',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'wp_ganga',
    title: 'Varanasi Ganga Aarti',
    imageUrl: 'https://images.unsplash.com/photo-1561361062-652237d73291?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'wp_peacock',
    title: 'Peacock Feather',
    imageUrl: 'https://images.unsplash.com/photo-1516617442634-75371039bd3b?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'wp_lotus',
    title: 'Lotus on Water',
    imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format&fit=crop&q=80',
  }
];

export const INITIAL_REMINDERS: readonly Reminder[] = [
  { id: 'rem_morning', title: 'Morning Aarti', time: '06:00 AM', isEnabled: true },
  { id: 'rem_sandhya', title: 'Sandhya Aarti', time: '06:30 PM', isEnabled: true },
  { id: 'rem_panchang', title: 'Daily Panchang', time: '08:00 AM', isEnabled: false },
];
