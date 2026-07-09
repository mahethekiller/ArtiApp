export type RootStackParamList = {
  MainTabs: undefined;
  AartiPlayer: {
    readonly aartiId: string;
    readonly initialMode?: 'audio' | 'video';
  };
};

export type MainTabParamList = {
  Home: undefined;
  Aarti: undefined;
  Gallery: undefined;
  Profile: undefined;
};
