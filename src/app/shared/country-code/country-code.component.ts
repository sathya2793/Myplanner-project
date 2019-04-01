import { Component, OnInit, Output , EventEmitter, Input} from '@angular/core';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-country-code',
  templateUrl: './country-code.component.html',
  styleUrls: ['./country-code.component.css']
})
export class CountryCodeComponent implements OnInit {
  @Input()  country_Name:any;
  @Output() countryCodeEvent =new EventEmitter<string>();
  @Output() countryNameEvent =new EventEmitter<string>();
  public countryName: any;
  public CountriesNames: any;
  public countryCode: any;
  public countryCodes: any;
  public allcountries: any;
  public countries: any [] = [];
  public country: any;
  countries_value: any;
  constructor(public appService: AppService) { }

  ngOnInit() {
    this.showDropdown();
    this.getCountryCodes();
    this.getCode();
    
  }
  public getCode = () => {
    if(this.country_Name)
    {
    this.appService.getCountryList()
    .subscribe((data) => {
    for (let key in data) {
      if(data[key]===this.country_Name){
         this.countryName= key;
         break;
     }
   }
    });
  }
  }

  public showDropdown = () => {
    this.appService.getCountryList()
    .subscribe((data) => {
      this.allcountries = data;
      for( let i in data){
      let oneCountry = {
        name: data[i],
        code: i
      }
      this.countries.push(oneCountry);
    }
      // set for dropdown in sort order
    this.countries.sort((a, b) => a.name.localeCompare(b.name));
    //end sort
  })
}

public getCountryCodes: any = () => {
  this.appService.getCountryCodes()
    .subscribe((data) => {
      this.countryCodes = data;
    })//end subscribe
}//end getCountries

public onChangeCountry: any = (code) => {
  this.countryCodeEvent.emit(this.countryCodes[code]);
  this.countryNameEvent.emit(this.allcountries[code]);
}//end onChangeCountry

}
