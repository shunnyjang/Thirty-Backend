import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { User } from 'src/entities';
import { CommunityResponse } from './community-response.type';

@Injectable()
export class CommunityService {
  constructor(private readonly em: EntityManager) {}

  async getFriendCommunityList(user: User): Promise<CommunityResponse[]> {
    return this.em.execute(`
        select a.id as answerId
             , b.id as bucketId
             , u.id as userId
             , u.nickname as userNickname
             , c.title as challenge
             , m.detail as mission
             , a."date"
             , a.image
             , a.detail
             , a.music
             , a.stamp
             , a.created_at
         from  answer a
        inner  join bucket b 
           on  a.bucket_id = b.id
        inner  join challenge c 
           on  b.challenge_id = c.id
        inner  join mission m 
           on  c.id = m.challenge_id 
          and  a."date" = m."date" 
        inner  join relation r
           on  b.user_id = r.friend_id
        inner  join "user" u
           on  b.user_id = u.id
        where  1=1
          and  r.user_id = '${user.id}'
          and  u.visibility != 'PRIVATE'
        order  by a.created_at DESC
        ;
    `);
  }

  async getAllCommunityList(user: User): Promise<CommunityResponse[]> {
    return this.em.execute(`
        select a.id as answerId
             , b.id as bucketId
             , u.id as userId
             , u.nickname as userNickname
             , c.title as challenge
             , m.detail as mission
             , a."date"
             , a.image
             , a.detail
             , a.music
             , a.stamp
             , a.created_at
             , case when (select count(*) from relation r where r.user_id = '${user.id}' and friend_id = u.id) = 0 then false
               else true
               end as isFriend
         from  answer a
        inner  join bucket b 
           on  a.bucket_id = b.id
        inner  join challenge c 
           on  b.challenge_id = c.id
        inner  join mission m 
           on  c.id = m.challenge_id 
          and  a."date" = m."date" 
        inner  join "user" u
           on  b.user_id = u.id
        where  1=1
          and  u.visibility = 'PUBLIC'
        order  by a.created_at DESC
        ;
    `);
  }
}
