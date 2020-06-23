import { Component, OnInit, Inject } from '@angular/core';
import { Leader } from '../shared/leader';
import { LeaderService } from '../services/leader.service';
import { flyInOut, expand } from '../animations/app.animation';
import { baseURL } from '../shared/baseurl';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  host:{
    '[@flyInOut]':'true',
    'style':'display:block;'
  },
  animations:[
    flyInOut(),
    expand()
  ]
})
export class AboutComponent implements OnInit {

  leaders:Leader[];
  leadererr:string;

  constructor(private leaderService:LeaderService,
    @Inject('BaseURL') public BaseURL){ }

  ngOnInit(): void {
    this.leaderService.getleaders()
    .subscribe((leaders)=>this.leaders=leaders,
    errmess=>this.leadererr=<any>errmess);
  }

}
