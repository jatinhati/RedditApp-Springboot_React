package org.example.quoraproject.config;

import org.example.quoraproject.models.Community;
import org.example.quoraproject.models.Post;
import org.example.quoraproject.models.User;
import org.example.quoraproject.repositories.CommunityRepository;
import org.example.quoraproject.repositories.PostRepository;
import org.example.quoraproject.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommunityRepository communityRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Clean database setup - no dummy data
        System.out.println("DataInitializer: Database ready for fresh data");
    }

    private void initializeData() {
        // Create test users
        User user1 = new User();
        user1.setUsername("testuser");
        user1.setEmail("test@example.com");
        user1.setPassword(passwordEncoder.encode("password123"));
        user1.setEnabled(true);
        user1 = userRepository.save(user1);

        User user2 = new User();
        user2.setUsername("admin");
        user2.setEmail("admin@example.com");
        user2.setPassword(passwordEncoder.encode("admin123"));
        user2.setEnabled(true);
        user2 = userRepository.save(user2);

        // Create test communities
        Community tech = new Community();
        tech.setName("technology");
        tech.setDisplayName("r/technology");
        tech.setDescription("Technology news and discussions");
        tech.setCreator(user1);
        tech.setMemberCount(150);
        tech = communityRepository.save(tech);

        Community programming = new Community();
        programming.setName("programming");
        programming.setDisplayName("r/programming");
        programming.setDescription("Programming discussions and help");
        programming.setCreator(user1);
        programming.setMemberCount(200);
        programming = communityRepository.save(programming);

        Community gaming = new Community();
        gaming.setName("gaming");
        gaming.setDisplayName("r/gaming");
        gaming.setDescription("Gaming news and discussions");
        gaming.setCreator(user2);
        gaming.setMemberCount(300);
        gaming = communityRepository.save(gaming);

        Community askreddit = new Community();
        askreddit.setName("askreddit");
        askreddit.setDisplayName("r/AskReddit");
        askreddit.setDescription("Ask and answer thought-provoking questions");
        askreddit.setCreator(user2);
        askreddit.setMemberCount(500);
        askreddit = communityRepository.save(askreddit);

        // Create test posts
        Post post1 = new Post();
        post1.setTitle("Welcome to Technology!");
        post1.setContent("This is a test post about technology. Feel free to discuss the latest tech trends here.");
        post1.setType(Post.PostType.TEXT);
        post1.setUser(user1);
        post1.setCommunity(tech);
        post1.setUpvotes(10);
        post1.setDownvotes(2);
        post1.setScore(8);
        postRepository.save(post1);

        Post post2 = new Post();
        post2.setTitle("Best Programming Languages in 2025");
        post2.setContent("What do you think are the most important programming languages to learn this year?");
        post2.setType(Post.PostType.TEXT);
        post2.setUser(user2);
        post2.setCommunity(programming);
        post2.setUpvotes(25);
        post2.setDownvotes(3);
        post2.setScore(22);
        postRepository.save(post2);

        Post post3 = new Post();
        post3.setTitle("Gaming Setup Recommendations");
        post3.setContent("Looking for advice on building a new gaming PC. What components would you recommend?");
        post3.setType(Post.PostType.TEXT);
        post3.setUser(user1);
        post3.setCommunity(gaming);
        post3.setUpvotes(15);
        post3.setDownvotes(1);
        post3.setScore(14);
        postRepository.save(post3);

        System.out.println("Test data initialized successfully!");
    }
}