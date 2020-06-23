import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
import { DISHES } from '../shared/dishes';
import { visibility, flyInOut, expand } from '../animations/app.animation';
@Component({
  selector: 'app-dish-detail',
  templateUrl: './dish-detail.component.html',
  styleUrls: ['./dish-detail.component.scss'],
  host:{
    '[@flyInOut]':'true',
    'style':'display:block;'
  },
  animations: [
    visibility(),
    flyInOut(),
    expand()
  ]
})
export class DishDetailComponent implements OnInit {

  commentForm: FormGroup;
  comment:Comment;
  dishcopy:Dish;
 
  @ViewChild('ffform') commentFormDirective;

  dish:Dish;
  dishIds:string[];
  prev:string;
  next:string;
  errMess:string;
  visibility='shown';

  formErrors={
    'author':'',
    'comment':''
  };

  validationMessages={
    'author':{
      'required':'Author name is required.',
      'minlength':'Author name must be at least 2 characters long.',
      'maxlength':'Author name cannot be more than 25 characters long.'
    },
    'comment':{
      'required':'Comment is required.',
      'minlength':'Comment must be at least 2 characters long.',
      'maxlength':'Comment cannot be more than 25 characters long.'
    }
  };

  constructor(private dishService: DishService,
    private location: Location,
    private route: ActivatedRoute,
    private fb:FormBuilder,
    @Inject('BaseURL') public BaseURL) 
    { 
      this.createForm();
    }

  ngOnInit(): void {
    this.dishService.getDishIds()
      .subscribe((dishIds)=>this.dishIds=dishIds,
      errmess=>this.errMess=<any>errmess);
    this.route.params
      .pipe(switchMap((params:Params)=>{ this.visibility='hidden'; return this.dishService.getDish(params['id']);}))
      .subscribe((dish)=>{ this.dish=dish; this.dishcopy=dish; this.setPrevNext(dish.id); this.visibility='shown'; },
      errmess=>this.errMess=<any>errmess);
  }

  setPrevNext(dishId:string){
    const index=this.dishIds.indexOf(dishId);
    this.prev=this.dishIds[(this.dishIds.length+index-1) % this.dishIds.length];
    this.next=this.dishIds[(this.dishIds.length+index+1) % this.dishIds.length];

  }
  goBack():void{
    this.location.back();
  }

  createForm(){
    this.commentForm=this.fb.group({
      author:['',[Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      comment:['',[Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      rating:5,
      date:''
    });

    this.commentForm.valueChanges
    .subscribe(data=>{
      
      this.onValueChanged(data);});

    this.onValueChanged();
  }

  onValueChanged(data?:any){
    if(!this.commentForm){return;}

    const form=this.commentForm;

    for(const field in this.formErrors)
    {
      if(this.formErrors.hasOwnProperty(field))
      {
        this.formErrors[field]='';
        const control=form.get(field);
        if(control && control.dirty && !control.valid)
        {
          const messages=this.validationMessages[field];
          for(const key in control.errors){
           
            this.formErrors[field]+=messages[key]+' '; 
          }
        }
      }
    }

  }
 
  

  formatLabel(value: number) {
    
 
    return value;
  }

  onSubmit(){
    var d = new Date();
    var n = d.toISOString();
    this.commentForm.value.date=n;

    this.comment=this.commentForm.value;
    this.dishcopy.comments.push(this.comment);
    this.dishService.putDish(this.dishcopy)
    .subscribe(dish=>{
      this.dish=dish; this.dishcopy=dish;
      },
      errmess=>{
        this.dish=null; this.dishcopy=null; this.errMess=<any>errmess;
      });
    console.log(this.comment,DISHES[this.dish.id].comments);
   
    this.commentForm.reset({
      author:'',
      comment:'',
      
    });
    this.commentFormDirective.resetForm(); 
  }

}
