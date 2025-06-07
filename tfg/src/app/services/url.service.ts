import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  constructor() { }

  getImageUrl(path: string): string {
    // Si la URL ya es completa, la devolvemos tal cual
    if (path.startsWith('http')) {
      return path;
    }
    
    // Si no, construimos la URL completa
    return environment.url + '/' + path;
  }
} 