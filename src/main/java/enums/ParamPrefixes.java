package enums;

public enum  ParamPrefixes {
    INPUT("-i "),
    INPUT_SECOND("-s "),
    INPUT_THIRD("-d "),
    INPUT_FOURTH("-f "),
    OUTPUT("-o "),
    EVAL_THRESH("-e "),
    FETCH_FROM_IDS("-f "),
    FETCH_FROM_TREE("-t "),

    //prepareNames specific parameters
    FETCH_FROM_MIST("-m "),
    FETCH_FROM_NCBI("-r "),
    REMOVE_DASHES("-d "),

    //cd-hit
    REDUNDANCY("-c "),
    MEMORY("-m "),
    CDHIT_PATH("-A "),


    //alignment specific parameters
    DO_ALIGN("-d "),
    ALGORITHM("-a "),
    THREADS_MAFFT("-t "),
    MAFFT_PATH("-f "),

    //tree building specific parameters
    //Mega params
    TREE_BUILDING_PROGRAM("-B "),
    MEGACC_PATH("-k "),
    THREADS_GENERAL("-u "),
    TREE_BUILD_METHOD("-m "),
    AA_SUBST_MODEL("-l "),
    AA_SUBST_RATE("-n "),
    INITIAL_TREE_ML("-e "),
    GAPS_AND_MISSING_DATA("-g "),
    SITE_COV_CUTOFF("-c "),
    PHYLOGENY_TEST("-p "),
    NUMBER_OF_REPLICATES("-b "),
    OUTPUT_PARAMS("-x "),
    OUTPUT_TREE("-z "),

    //FastTree params
    PHYLOGENY_TEST_FT("-P "),
    SUBST_MODEL_FT("-M "),
    PSEUDOCOUNTS_FT("-S "),
    NUMBER_OF_REPLICATES_FT("-R "),
    FAST_TREE_PATH("-K "),

    //protein features prediction specific parameters
    DO_PREDICT_FETURES("-p "),
    DOMAINS_PREDICTION_PROGRAM("-p "),
    DOMAINS_PREDICTION_DB("-D "),
    OUTPUT_SECOND("-n "),
    OUTPUT_THIRD("-b "),
    OUTPUT_FOURTH("-r "),
    OUTPUT_FIFTH("-f "),
    OUTPUT_SIXTH("-x "),
    OUTPUT_SEVENTH("-a "),
    HMMSCAN_DB_PATH("-A "),
    RPSBLAST_DB_PATH("-B "),
    RPSBPROC_DB_PATH("-C "),

    HMMSCAN_PATH("-H "),
    PROBABILITY("-y "),
    RPSBLAST_PATH("-R "),
    RPSBPROC_PATH("-P "),
    TMHMM_PATH("-T "),
    SEGMASKER_PATH("-S "),
    RUN_SEGMASKER("-E "),
    ENUMERATE("-e "),

    //gene_neighbors.py specific parameters
    NOT_SHARED_DOMAIN_TOLERANCE("-n "),
    OPERON_TOLERANCE("-p "),
    NUMBER_OF_NEIGHBORS("-b "),
    PROCESS_NUMBER("-c ");

    private String paramPrefix;

    ParamPrefixes(String paramPrefix) {
        this.paramPrefix = paramPrefix;
    }

    public String getPrefix() {
        return paramPrefix;
    }

}
