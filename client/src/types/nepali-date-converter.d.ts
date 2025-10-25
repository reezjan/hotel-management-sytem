declare module '@remotemerge/nepali-date-converter' {
  export default class DateConverter {
    constructor(dateString: string);
    
    toBs(): {
      year: number;
      month: number;
      day: number;
      strDate: string;
    };
    
    toAd(): {
      year: number;
      month: number;
      day: number;
      strDate: string;
    };
  }
}
