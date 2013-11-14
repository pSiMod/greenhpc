sim: clean
	g++ -g -DLINEAL_ALLOC  sim.cpp -o titantopologysim_lineal -I.
	g++ -g -DRANDOM_WHOLE_MACHINE_ALLOC  sim.cpp -o titantopologysim_random_whole_machine -I.
	g++ -g -DRANDOM_SUBSET_MACHINE_ALLOC  sim.cpp -o titantopologysim_random_subset_machine -I.
	g++ -g -DCORES_PER_CPU_ALLOC=1  sim.cpp -o titantopologysim_cpu_ranks_1 -I.
	g++ -g -DCORES_PER_CPU_ALLOC=2  sim.cpp -o titantopologysim_cpu_ranks_2 -I.
	g++ -g -DCORES_PER_CPU_ALLOC=4  sim.cpp -o titantopologysim_cpu_ranks_4 -I.
	g++ -g -DCORES_PER_CPU_ALLOC=8  sim.cpp -o titantopologysim_cpu_ranks_8 -I.
	g++ -g -DCORES_PER_CPU_ALLOC=32 -DTHREADS_PER_CPU=32 sim.cpp -o titantopologysim_cpu_ranks_32 -I.

clean:
	rm -f titantopologysim_*
