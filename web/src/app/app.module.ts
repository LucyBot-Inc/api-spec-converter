import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {APP_BASE_HREF} from '@angular/common';

import { AppComponent }       from './app.component';
import { HomeComponent }       from './home/home.component';
import {ReadmeComponent} from './readme/readme.component'
import {SpecConverterComponent} from './spec-converter/spec-converter.component'

import {PlatformService} from './services/platform.service';

import { environment } from '../environments/environment';

@NgModule({
  imports: [
    BrowserModule.withServerTransition({appId: 'my-app'}),
    HttpModule,
    FormsModule,
  ],
  providers: [
    {provide: APP_BASE_HREF, useValue: environment.baseHref || '/'},
    PlatformService,
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    ReadmeComponent,
    SpecConverterComponent,
  ],
  bootstrap: [ AppComponent ],
})
export class AppModule { }
