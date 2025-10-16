package com.recruitment.platform.userprofile.repository;

import com.recruitment.platform.userprofile.model.Profile;

import org.springframework.data.jpa.repository.JpaRepository;



import java.util.List;



public interface ProfileRepository extends JpaRepository<Profile, Long> {

    List<Profile> findByUserIdIn(List<Long> userIds);

}


