import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AdminService} from './admin.service';
// uploading File
import {FileUploader} from 'ng2-file-upload';
import {User} from '../model/user';
import {Tab} from './tab';
@Component({
  selector: 'admin-app',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {
  result: any;
  sfa: any;
  data: any;
  page: any = true;
  userss: any;
  public uploader: FileUploader = new FileUploader({url: '/api/upload'});
  currentUser: User;
  user: User;
  structure: any = null;
  username: any = null;
  password: any = null;
  filegmc: any = null;
  filesfa: any = null;
  arrayFiliale: string[] = ['filiale1', 'rapideracking', 'key', 'pichon', 'witre', 'casalsport', 'ikaros', 'manuco'];
  tabs: Tab[] = [{title: 'Upload', active: false}, {title: 'Users', active: false}, {title: 'Filiales', active: false}, {title: 'Others', active: false}];
  selectedTab: Tab;


  constructor(private _http: Http, private _adminService: AdminService, private router: Router, private _location: Location) {

    this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
    this.getusers();
  }

  ngOnInit() {
    if(this.tabs != null && this.tabs.length >0 ){
        this.selectTab(this.tabs[0]);    
    }

  }

  backClicked() {
    this._location.back();
  }
  insertion() {
    var number = 0;


    if (this.currentUser.structure == "manutan") {

      for (let item of this.uploader.queue) {
        if ((item.file.name.includes("manutanGMC") && item.file.type == "text/xml") && item.isSuccess == true) {
          console.log("GOOOD");
          this.filegmc = item.file.name;
          number++;

        }
        else if ((item.file.name.includes("manutanSFA") && item.file.type == "text/xml") && item.isSuccess == true) {
          console.log("GOOOD");
          this.filesfa = item.file.name;
          number++;

        }


        else if (item.isSuccess == false) {
          alert("Erreur : Veuillez charger le fichier tout d'abord");
        }

        console.log("=>", this.result);
      }
      if (number == 2) {
        let model = {"filename": null};
        let model2 = {"filename": null};
        var headers = new Headers();
        headers.append('content-type', 'application/json');

        model.filename = this.filegmc;
        model2.filename = this.filesfa;
        this._http.post('/api/insertion', JSON.stringify(model), {headers: headers})
          .subscribe(data => {
            this.data = data;
            //console.log("=> ",this.data._body);
            //window.location.reload();            			
          });
        this._http.post('/api/insertionsfa', JSON.stringify(model2), {headers: headers})
          .map(sfa => this.sfa = sfa.json().data)
          .subscribe(sfa => this.sfa = sfa);
        this._http.post('/api/insertion4', JSON.stringify(model2), {headers: headers})
          .subscribe(data => console.log("=>  insertion Attribut =>"));
        this._http.post('/api/insertion5', JSON.stringify(model2), {headers: headers})
          .subscribe(data => console.log("=>  insertion UNITS =>"));

        setTimeout(() => {this.data = ""}, 10000);
        window.location.reload();



        alert("Données MANUTAN Bien Chargés!");

      } else
        alert("Veuillez charger les deux fichiers MANUTAN GMC et SFA ");
    } else {


      for (let item of this.uploader.queue) {
        if (item.file.name.includes(this.currentUser.structure) && item.isSuccess == true) {
          let model = {structure: null, filename: null};
          model.structure = this.currentUser.structure;
          model.filename = item.file.name;
          console.log("=>  filename csv =>", model.filename);

          var headers = new Headers();
          headers.append('content-type', 'application/json');

          this._http.post('/api/csv', JSON.stringify(model), {headers: headers})
            .subscribe(data => {
              this.data = data;
              //console.log("=> ",this.data._body);
              window.location.reload();
            });

          alert("Fichier bien chargé");
        } else if (item.isSuccess == false) {
          alert("Erreur : Veuillez charger le fichier tout d'abord");
        }
        else {
          alert("Erreur : Veuillez charger le fichier de filiale ");
        }
        console.log("=>", this.result);
      }
    }

  }

  uploadAll() {
    if (this.currentUser.structure == "manutan") {
      for (let item of this.uploader.queue) {
        if (item.file.name.includes("filiale1") || item.file.name == "api2.js" ||
          (item.file.name.includes("manutanGMC") && item.file.type == "text/xml") ||
          (item.file.name.includes("manutanSFA") && item.file.type == "text/xml")) {
          item.upload();
        }
        else {
          item.isError = true;
        }
      }
    } else {

      for (let item of this.uploader.queue) {
        //console.log("TEST ARRAY FILIALE  => ", this.arrayFiliale.includes(item.file.name)); 
        if (item.file.name.includes(this.currentUser.structure)) {
          item.upload();
        } else {
          item.isError = true;
        }
      }
    }

  }
  upload(item: any) {
    if (this.currentUser.structure == "manutan") {
      if (item.file.name == "api2.js" || item.file.name.includes("manutanGMC") || item.file.name.includes("manutanSFA")) {
        item.upload();
      } else {
        item.isError = true;
      }
    } else if (item.file.name.includes(this.currentUser.structure)) {
      item.upload();
    } else
      item.isError = true;

  }

  getusers() {
    //if (this.currentUser.structure == "manutan") {
    this.page = false;

    this._http.get("/api/users")
      .map(result => this.result = result.json().data)
      .subscribe(res => this.userss = res);
  }
  uploadpage() {
    //if (this.currentUser.structure == "manutan") {
    this.page = !this.page;

    //}	
  }
  addUser() {
    if (this.currentUser.structure == "manutan") {
      console.log("ADDING USER");
      if (this.username == null || this.structure == null || this.password == null) {
        alert("champ obligatoire");
      } else {
        var newUser = {
          structure: this.structure,
          username: this.username,
          admin: true,
          password: this.password
        }
        console.log("=>", newUser);
        var headers = new Headers();
        headers.append('content-type', 'application/json');
        this._http.post('api/user', JSON.stringify(newUser), {headers: headers})
          .map(res => res.json())
          .subscribe(user => {
            this.user = user,
              this.userss.push(this.user),
              alert("Utilisateur bien ajouté")

          });


      }
    } else {
      console.log("ADDING USER");
      if (this.username == null || this.password == null) {
        alert("champ obligatoire");
      } else {
        var newUser2 = {
          structure: this.currentUser.structure,
          username: this.username,
          admin: true,
          password: this.password
        }
        console.log("=>", newUser2);
        var headers = new Headers();
        headers.append('content-type', 'application/json');
        this._http.post('api/user', JSON.stringify(newUser2), {headers: headers})
          .map(res => res.json())
          .subscribe(user => {
            this.user = user,
              this.userss.push(this.user),
              alert("Utilisateur bien ajouté")

          });


      }

    }
  }

  deleteUser(username: any) {
    var users = this.userss;
    console.log("=>delete: ", username);
    this._http.get("/api/userdel/" + username)
      .map(res => res.json())
      .subscribe(data => {
        //if(data.n == 1){
        for (var i = 0; i < this.userss.length; i++) {
          if (this.userss[i].username == username) {
            this.userss.splice(i, 1);
          }
        }
        //} 
      });



  }


  selectTab(tab: Tab) {
    // deactivate all tabs
    this.tabs.forEach(tab => tab.active = false);

    // activate the tab the user has clicked on.
    tab.active = true;
    this.selectedTab = tab;
  }

  isSelectedTab(tabTitle: string) {
    return this.selectedTab != null && this.selectedTab.title === tabTitle;
  }



}
