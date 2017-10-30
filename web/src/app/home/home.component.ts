import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
    selector: 'home',
    templateUrl: './home.pug',
    styles: [`
      h1 {
        margin-bottom: 50px;
      }
      .social-buttons {
        margin-bottom: 20px;
      }
      .social-buttons .fa {
        font-size: 18px;
      }
      spec-converter {
        display: block;
        margin-top: 50px;
      }
    `],
})
export class HomeComponent {
  githubLink = 'https://github.com/LucyBot-Inc/api-spec-converter';

  constructor() {
  }
}
