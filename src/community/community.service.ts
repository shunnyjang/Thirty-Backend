import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { BucketStatus } from 'src/buckets/bucket-status.enum';
import { Relation, User } from 'src/entities';
import { RelationStatus } from 'src/relation/relation-stautus.enum';
import { UserVisiblity } from 'src/user/user-visibility.enum';
import { CommunityResponse } from './community-response.type';

@Injectable()
export class CommunityService {
  constructor(private readonly em: EntityManager) {}

  async getFriendCommunityList(user: User): Promise<CommunityResponse[]> {
    return this.em.execute(`
        with friends as (
         select r.friend_id
              , u.nickname as usernickname
           from relation r
          inner join "user" u
             on u.id = r.friend_id
          where 1=1
            and r.user_id = '${user.id}'
            and r.status = '${RelationStatus.CONFIRMED}'
            and u.visibility != '${UserVisiblity.PRIVATE}'
         )
         select a.id as answerId
             , b.id      as bucketId
             , b.user_id as userId
             , f.nickname
             , c.title   as challenge
             , m.detail  as mission
             , b.status  as bucket_status
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
        inner  join friends f
           on  b.user_id = f.friend_id
        where  1=1
          and  b.status != '${BucketStatus.ABANDON}'
          and  a.is_deleted = false
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
             , b.status
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
          and  b.status != '${BucketStatus.ABANDON}'
          and  a.is_deleted = false
          and  u.visibility = 'PUBLIC'
          and  not exists ( select 1
                              from blocked bl
                             where 1=1
                               and bl.user_id = '${user.id}'
                               and b.user_id = bl.target_user_id )
        order  by a.created_at DESC
        ;
    `);
  }
}
